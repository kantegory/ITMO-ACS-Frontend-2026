import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import App from './App.vue';
import router from './router/index.js';

createApp(App).use(createPinia()).use(router).mount('#app');
