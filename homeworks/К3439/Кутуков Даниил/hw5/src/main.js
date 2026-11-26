import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import NotesView from './views/NotesView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', redirect: '/notes' }, { path: '/notes', component: NotesView }],
});
createApp(App).use(createPinia()).use(router).mount('#app');
