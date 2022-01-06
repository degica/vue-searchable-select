import SearchableSelect from './js/Component.vue';
import { createApp, ref } from 'vue';

function searchableSelectInit(searchFunctions) {
  const searchableSelects = document.querySelectorAll('input[data-searchable-select]');

  searchableSelects.forEach(element => {
    const parent = element.parentNode;
    const appContainer = document.createElement('div');

    const search = searchFunctions[element.dataset.searchableSelect];
    const name = element.name;

    const modelValue = ref(null);
    try {
      modelValue.value = JSON.parse(element.value);
    } catch (_) {
      modelValue.value = element.value;
    }

    const app = createApp(SearchableSelect, { name, search, modelValue });

    parent.replaceChild(appContainer, element);
    app.mount(appContainer);
  });
}

export default SearchableSelect;
export {
  SearchableSelect,
  searchableSelectInit
}
