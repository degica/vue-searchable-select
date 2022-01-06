<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar navbar-light bg-white shadow-sm mb-3">
      <span class="navbar-brand mb-0">SearchableSelect demo</span>
      <ul class="navbar-nav ml-auto">
        <li class="nav-item">
          <a class="nav-link" href="https://github.com/degica/vue-searchable-select"
             target="_blank"> GitHub</a></li>
      </ul>
    </nav>
    <main class="container">
      <div class="row">
        <div class="col-md-8 mb-3">
          <div class="card">
            <form class="card-body" method="post" @submit.prevent="show">
              <label>
                <span>whats up</span>
                <SearchableSelect
                  v-model="selected"
                  :search="search"
                />
              </label>

              <label>
                test vanilla
                <select>
                  <option>one</option>
                  <option>two</option>
                  <option>three</option>
                </select>
              </label>
            </form>

            Selected:
            <pre>{{ selected }}</pre>
          </div>
        </div>

        <aside class="col-md-4 mb-3">
          <div class="card">
            <div class="card-header"> Links</div>
            <div class="card-body">
              <ul>
                <li><a href="https://github.com/degica/vue-searchable-select" target="_blank">GitHub</a></li>
                <li><a href="https://www.npmjs.com/package/vue-searchable-select" target="_blank">npm</a></li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </main>
    <footer class="text-center text-muted small mb-3">
      Copyright © 2021 Degica
    </footer>
  </div>
</template>

<style>
form {
  display: flex;
  flex-direction: column;
}

label {
  display: flex;
  flex-direction: row;
}

label > * {
  margin: 5px;
  justify-content: center;
}
</style>

<script>
import SearchableSelect from '../src/index.js';

export default {
  name: 'app',
  data() {
    return {
      selected: { value: '??', text: 'type something!' }
    }
  },
  components: { SearchableSelect },
  methods: {
    search(query, page) {
      console.log("Starting mock search of", query, 'page', page);
      return new Promise((resolve, _) => {
        if (query) {
          if (page >= 10) return resolve([]);
          setTimeout(
            () => {
              resolve([
                page * 10 + 0,
                page * 10 + 1,
                page * 10 + 2,
                page * 10 + 3,
                page * 10 + 4,
                page * 10 + 5,
              ].map(x => ({ value: `${x}`, text: `${query.toUpperCase()} ${x}` })));
            },
            1000
          );
        }
        else {
          setTimeout(
            () => {
              resolve([
                page * 10 + 0,
                page * 10 + 1,
                page * 10 + 2,
                page * 10 + 3,
                page * 10 + 4,
                page * 10 + 5,
              ].map(x => `<nothing> ${x}`));
            },
            200
          );
        }
      });
    }
  }
}
</script>
