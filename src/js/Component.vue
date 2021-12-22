<template>
  <div>
    <input
      type="text"
      v-model="query"
    />
    <ul>
      <li v-for="option in options" :key=option>
        {{ option }}
      </li>
    </ul>
  </div>
</template>

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
  setup(props) {
    // This is the current search results; the selectable options displayed to
    // the user.
    const options = ref([]);

    // This is the current page. It will increment when the user scrolls down.
    // When the search query is modified, it will be set back to 1.
    const currentPage = ref(1);

    // Debounced search function.
    const debouncedSearch = debounce(
      async (q, p) => {
        options.value = await props.search(q, p);
      },
      props.debounceTime,
      {
        leading: true,
        trailing: true
      }
    );

    // This is the search query that the user types in.
    // Whenever it's changed, we update the search promise.
    const query = ref('');
    watch(query, value => {
      debouncedSearch(value, 1);
      currentPage.value = 1;
    });

    // This is called when the user scrolls to the bottom.
    // Note that we don't debounce this... Should we?
    // TODO: do we need 2 page trackers? pending page and current actual page..
    const nextPage = async () => {
      currentPage.value += 1;
      const results = await props.search(query.value, currentPage.value);
      options.value = options.value.concat(results);
    };

    // Values exposed to the template:
    return {
      query,
      options,
      nextPage
    };
  }
})
</script>
