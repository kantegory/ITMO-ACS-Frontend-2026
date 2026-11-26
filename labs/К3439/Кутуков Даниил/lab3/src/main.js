import 'bootstrap/dist/css/bootstrap.min.css';
import '@lab1/styles.css';
import '@homework/hw2/accessibility.css';
import '@homework/hw3/theme.css';
import './styles.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { createSiteRouter } from './router.js';
import { applyTheme } from '@homework/hw3/theme.js';

const pinia = createPinia();
const router = createSiteRouter(pinia);
applyTheme();

const app = createApp(App).use(pinia).use(router);
await router.isReady();
app.mount('#app');
