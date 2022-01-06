'use strict';

import { createApp } from 'vue';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/themes/default/index.scss'

import App from './App.vue';
import { searchableSelectInit } from '../src/index.js';

if (document.getElementById('app')) {
  const app = createApp(App);
  app.mount('#app')
}
else {
  const testform = document.getElementById('test-form');
  testform.onsubmit = event => {
    event.preventDefault();
    const formdata = new FormData(testform);
    const obj = {}
    for (const key of formdata.keys()) {
      obj[key] = formdata.get(key);
    }
    console.log(obj);
    document.getElementById('form-data-dump').textContent = JSON.stringify(obj, ' ', 2);
  }

  searchableSelectInit({
    mySearch(query, page) {
      console.log("Starting mock search of", query, 'page', page);
      return new Promise((resolve, _) => {
        if (query === 'empty') {
          setTimeout(() => resolve([]), 500);
        }
        else if (query) {
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
  });
}
