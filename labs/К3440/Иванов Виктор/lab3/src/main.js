import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';
import App from './App.vue';
import HomePage from './pages/HomePage.vue';
import RestaurantPage from './pages/RestaurantPage.vue';
import AuthPage from './pages/AuthPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import { useAuth } from './composables/useAuth';

const routes = [
  { path: '/', component: HomePage, meta: { title: 'Рестораны' } },
  { path: '/restaurants/:id', component: RestaurantPage, meta: { title: 'Ресторан' } },
  { path: '/login', component: AuthPage, props: { mode: 'login' }, meta: { title: 'Вход' } },
  { path: '/register', component: AuthPage, props: { mode: 'register' }, meta: { title: 'Регистрация' } },
  { path: '/profile', component: ProfilePage, meta: { title: 'Личный кабинет', auth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];
const router = createRouter({ history: createWebHistory(), routes, scrollBehavior: to => to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 } });
router.beforeEach(to => {
  document.title = `${to.meta.title || 'Столик'} — Столик`;
  if (to.meta.auth && !useAuth().user.value) return { path: '/login', query: { next: to.fullPath } };
});
createApp(App).use(router).mount('#app');
