'use strict';

import {createApp} from 'vue';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/themes/default/index.scss'

import App from './App.vue';

const app = createApp(App);
app.mount('#app')
