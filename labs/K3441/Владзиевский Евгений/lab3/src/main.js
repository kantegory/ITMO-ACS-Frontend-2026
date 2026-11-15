// Точка входа. Bootstrap ставится пакетом, а не с CDN: так сборка
// не зависит от сети, а свои стили гарантированно идут после него.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/style.css';

import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router/index.js';

createApp(App).use(router).mount('#app');
