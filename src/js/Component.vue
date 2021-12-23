<template>
  <div class='vue-searchable-select'>
    <input
      type="text"
      v-model="query"
      @keydown="keyHandler($event)"
      ref="input"
    />
    <ul @scroll="scrollHandler($event)">
      <li v-for="option, i in options" :key=option>
        <button ref="selected" v-if="i == selectedIndex">
          <span class='vue-searchable-select-selected'>{{ option }}</span>
        </button>
        <button v-else @click="selectedIndex = i">
          {{ option }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style>
.vue-searchable-select ul {
  overflow-y: scroll;
  height: 100px;
}

.vue-searchable-select-selected {
  background-color: red;
}
</style>

<script>
import { defineComponent, watch, reactive, ref, computed } from 'vue';
import debounce from 'lodash.debounce';

export default defineComponent({
  name: 'search-select',
  props: {
    search: {
      type: Function,
      required: true
    },
    debounceTime: {
      type: Number,
      default: 200
    }
  },
  watch: {
    async selectedIndex() {
      // This scrolls the UL to a point where we can actually see the selected
      // list item.
      await this.$nextTick();
      this.$refs.selected.focus();
      await this.$nextTick();
      this.$refs.input.focus();
    }
  },
  setup(props) {
    // This is the current search results; the selectable options displayed to
    // the user.
    const options = ref([]);
    const selectedIndex = ref(0);
    const selected = computed(() => (
      selectedIndex.value ? options.value[selectedIndex.value] : null
    ));
    watch(options, value => {
      if (selectedIndex.value >= value.length) selectedIndex.value = 0
    });

    // This will be called whenever the user input changes. It's debounced so
    // that we don't perform IO-heavy search operations too often.
    const debouncedSearch = debounce(
      async (query, page) => {
        options.value = await props.search(query, page);
      },
      props.debounceTime,
      {
        leading: true,
        trailing: true
      }
    );

    // This is the current page. It will increment when the user scrolls down.
    // When the search query is modified, it will be set back to 1.
    let currentPage = 1;

    // This is the search query that the user types in.
    // Whenever it's changed, we update the search promise.
    const query = ref('');
    watch(query, value => {
      debouncedSearch(value, 1);
      currentPage = 1;
    });

    // This is called when the user scrolls to the bottom.
    const nextPage = async () => {
      currentPage += 1;
      const results = await props.search(query.value, currentPage);
      options.value = options.value.concat(results);
    };

    // This function will handle the 'scroll' event for the options list.
    // If the user scrolls near the bottom, we ask for the next page.
    let pagePromise = null;
    const scrollHandler = event => {
      if (pagePromise !== null) return;
      if (event.target.scrollTop < event.target.scrollTopMax - 30) return;

      pagePromise = nextPage();
      pagePromise.then(() => pagePromise = null);
    };

    // This function handles keyboard input - up and down arrows will be used
    // to select next and previous options.
    const keyHandler = event => {
      switch (event.code) {
        case 'ArrowUp':
          event.preventDefault();
          if (selectedIndex.value > 0) selectedIndex.value -= 1;
          break;

        case 'ArrowDown':
          event.preventDefault();
          if (selectedIndex.value < options.value.length-1) selectedIndex.value += 1;
          break;
      }
    };

    // Values exposed to the template:
    return {
      query,
      options,
      scrollHandler,
      keyHandler,
      selectedIndex
    };
  }
})
</script>
