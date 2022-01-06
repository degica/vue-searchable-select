<template>
  <div class='vue-searchable-select'>
    <!--
      This is for just in case the consumer needs to perform vanilla HTML
      form submission. In most cases, one can simply pull the value out with
      v-model="myVar".
    -->
    <input v-if="name" type="hidden" :name="name" :value="selectedValue" />

    <!--
      This is the query input box. It's different from the "display" input box.
      The "display" box above will be shown when this "query" box is blurred.
    -->
    <input
      type="text"
      v-model="query"
      :style="showOptions ? {} : { display: 'none' }"
      :placeholder="selectedDisplay"
      @keydown="inputKeyHandler($event)"
      @focus="inputFocusHandler($event)"
      @blur="inputBlurHandler($event)"
      ref="searchInput"
    />

    <!--
      This is the aforementioned "display" input box. It only exists to show
      the selected value. As soon as the user clicks this, the above "query"
      input box will take its place.
    -->
    <input
      type="text"
      :value="selectedDisplay"
      :style="showOptions ? { display: 'none' } : {}"
      @focus="showOptions = true"
    />

    <!--
      The X will clear the input box if you click it.
    -->
    <ClearX v-if="showOptions" @click="query = ''" />

    <!--
      This caret is just eye candy, signalling that this is a select box.
    -->
    <Caret v-else @click="showOptions = true" />

    <!--
      This ul tag is the options tray. There's a lot of wacky logic in the
      script section that makes this behave more-or-less like a real select
      full of options.
    -->
    <ul v-if="showOptions" @scroll="scrollHandler($event)">
      <li v-for="option, i in options" :key="option.value ? option.value : option">
        <button
          :class="buttonClass(i)"
          @mouseover="hoverIndex = i"
          @click="buttonClicked(i)"
        >
          <span v-if="option.text">
            {{ option.text }}
          </span>
          <span v-else>
            {{ option }}
          </span>
        </button>
      </li>

      <li v-if="searchesInProgress > 0">
        <Loading />
      </li>
      <li v-else-if="options.length === 0" class='vue-searchable-select-no-results'>
        <span>{{ noResultsMessage() }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import Caret from './Caret.vue';
import ClearX from './ClearX.vue';
import Loading from './Loading.vue';
import { defineComponent, watch, ref, computed } from 'vue';
import debounce from 'lodash.debounce';

export default defineComponent({
  name: 'search-select',
  components: { Caret, ClearX, Loading },
  props: {
    modelValue: {
      type: [Object, String],
      required: true
    },
    search: {
      type: Function,
      required: true
    },
    name: {
      type: String,
      required: false
    },
    debounceTime: {
      type: Number,
      default: 200
    },
  },
  emits: ['update:modelValue'],
  methods: {
    buttonClass(i) {
      const classes = [];
      if (i === this.selectedIndex) {
        classes.push('vue-searchable-select-selected');
      }
      if (i === this.hoverIndex) {
        classes.push('vue-searchable-select-hover');
      }
      return classes;
    },

    buttonClicked(i) {
      this.selectedIndex = i;
      this.showOptions = false;
    },

    parentElement() {
      return this.$refs.searchInput.closest('.vue-searchable-select');
    },

    noResultsMessage() {
      if (this.$t) {
        return this.$t('vue_searchable_select.no_results');
      } else {
        return 'No results';
      }
    }
  },
  watch: {
    // This scrolls the UL to a point where we can actually see the selected
    // list item.
    //
    // It's a bit hacky, but far simpler than performing arithmetic and using
    // manual scroll functions.
    async hoverIndex() {
      this.ignoreFocus = true;

      await this.$nextTick();
      const hovered = this
        .parentElement()
        .getElementsByClassName('vue-searchable-select-hover')[0];
      if (hovered) { hovered.focus(); }

      await this.$nextTick();
      this.$refs.searchInput.focus();

      await this.$nextTick();
      this.ignoreFocus = false;
    },

    // This scrolls to the currently-selected option when the tray is opened.
    async showOptions(value) {
      if (!value) return;

      await this.$nextTick();
      const selected = this
        .parentElement()
        .getElementsByClassName('vue-searchable-select-selected')[0];
      if (selected) { selected.focus(); }

      await this.$nextTick();
      this.$refs.searchInput.focus();
    }
  },
  setup(props, { emit }) {
    // This is the current search results; the selectable options displayed to
    // the user.
    const options = ref([]);

    // Index of the currently hovered element. Pressing "enter" will select it.
    const hoverIndex = ref(0);
    watch(options, value => {
      if (hoverIndex.value >= value.length) hoverIndex.value = 0
    });

    // Index of the currently selected element.
    const selectedIndex = ref(null);

    // Raw selected object. Might be a string value or an object with 'value' and 'text' keys.
    const selected = computed(() => {
      if (typeof(selectedIndex.value) === 'number' && selectedIndex.value < options.value.length) {
        return options.value[selectedIndex.value];
      }
      else {
        return props.modelValue;
      }
    });
    watch(selected, value => emit('update:modelValue', value));

    // This is the "value" of the selected object.
    const selectedValue = computed(() => {
      if (selected.value && typeof(selected.value) === 'object')
        return selected.value.value;
      else
        return selected.value;
    });

    // This is the user-facing display text of the selected object.
    const selectedDisplay = computed(() => {
      if (selected.value && typeof(selected.value) === 'object')
        return selected.value.text;
      else
        return selected.value;
    });

    // This will be called whenever the user input changes. It's debounced so
    // that we don't perform IO-heavy search operations too often.
    //
    // There can be race conditions when 2 requests are in-flight and the
    // earlier one is too slow. Thus, we also have this seq number.
    let searchSeq = 0;
    let searchesInProgress = ref(0);
    const debouncedSearch = debounce(
      async (query, page) => {
        try {
          searchesInProgress.value += 1;
          options.value = [];
          const mySeq = (++searchSeq);
          const results = await props.search(query || '', page);

          if (searchSeq === mySeq) {
            options.value = results;
          }
        } finally {
          searchesInProgress.value -= 1;
        }
      },
      props.debounceTime,
      {
        leading: false,
        trailing: true
      }
    );

    // This is the current page. It will increment when the user scrolls down.
    // When the search query is modified, it will be set back to 0.
    let currentPage = 0;

    // This is the search query that the user types in.
    // Whenever it's changed, we update the search promise.
    const query = ref(
      props.modelValue && typeof(props.modelValue) === 'object' ?
        props.modelValue['text'] : props.modelValue
    );
    watch(query, value => {
      selectedIndex.value = null;
      debouncedSearch(value, 0);
      currentPage = 0;
    });

    // This is called when the user scrolls to the bottom.
    let lastPageEmpty = false;
    watch(query, () => lastPageEmpty = false);
    const nextPage = async () => {
      currentPage += 1;
      let results;
      try {
        searchesInProgress.value += 1;
        results = await props.search(query.value || '', currentPage);
      } finally {
        searchesInProgress.value -= 1;
      }

      if (results.length == 0) {
        // We don't want to search anymore if we hit an empty page.
        lastPageEmpty = true;
      }
      else {
        options.value = options.value.concat(results);
      }
    };

    // This function will handle the 'scroll' event for the options list.
    // If the user scrolls near the bottom, we ask for the next page.
    let pagePromise = null;
    const scrollHandler = event => {
      if (pagePromise !== null) return;
      if (lastPageEmpty) return;

      const scrollMax = event.target.scrollHeight - event.target.offsetHeight;
      if (event.target.scrollTop < scrollMax - 80) return;

      pagePromise = nextPage();
      pagePromise.then(() => pagePromise = null);
    };

    // This is whether or not the options tray is displayed.
    const showOptions = ref(false);

    // This function handles keyboard input - up and down arrows will be used
    // to select next and previous options.
    // Also supports "enter" for selecting the currently hovered option.
    const inputKeyHandler = event => {
      switch (event.code) {
        case 'ArrowUp':
          event.preventDefault();
          if (hoverIndex.value > 0) hoverIndex.value -= 1;
          break;

        case 'ArrowDown':
          event.preventDefault();
          if (hoverIndex.value < options.value.length-1) hoverIndex.value += 1;
          break;

        case 'PageUp':
          event.preventDefault();
          hoverIndex.value = Math.max(0, hoverIndex.value - 20);
          break;

        case 'PageDown':
          event.preventDefault();
          hoverIndex.value = Math.min(options.value.length - 1, hoverIndex.value + 20);
          break;

        case 'Enter':
          event.preventDefault();
          selectedIndex.value = hoverIndex.value;
          showOptions.value = false;
          break;
      }
    };

    // This is called when the user focuses the "display" text input.
    // Mainly, we want to show the search dropdown.
    // Also we can pre-populate the search results if necessary.
    let deselectTimer = null;
    const ignoreFocus = ref(false);
    const inputFocusHandler = () => {
      if (deselectTimer) {
        clearTimeout(deselectTimer);
        deselectTimer = null;
      }
      if (ignoreFocus.value) return;

      showOptions.value = true;

      if (options.value.length === 0) {
        debouncedSearch(query.value, 0);
        currentPage = 0;
      }
    };

    // Close the options tray on blur - after a delay.
    // We need the delay because the query input gets blurred quite a lot during
    // regular use.
    // There's no one event to reliably detect when it's blurred "for real".
    const inputBlurHandler = event => {
      if (deselectTimer) {
        clearTimeout(deselectTimer);
        deselectTimer = null;
      }

      deselectTimer = setTimeout(() => {
        if (document.activeElement !== event.target) {
          showOptions.value = false;
        }
      }, 500);
    };

    // Values exposed to the template:
    return {
      query,
      selected,
      options,
      showOptions,
      searchesInProgress,
      hoverIndex,
      selectedIndex,
      selectedValue,
      selectedDisplay,
      ignoreFocus,
      scrollHandler,
      inputKeyHandler,
      inputFocusHandler,
      inputBlurHandler,
    };
  }
})
</script>
