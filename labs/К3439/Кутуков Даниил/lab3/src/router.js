import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from './stores/session.js';
import CatalogView from './views/CatalogView.vue';
import RestaurantView from './views/RestaurantView.vue';
import AuthView from './views/AuthView.vue';
import AccountView from './views/AccountView.vue';
import HistoryView from './views/HistoryView.vue';
import NotFoundView from './views/NotFoundView.vue';

export function createSiteRouter(pinia) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'catalog', component: CatalogView, meta: { title: 'Рестораны Санкт-Петербурга' } },
      { path: '/restaurants/:id', name: 'restaurant', component: RestaurantView, meta: { title: 'Ресторан' } },
      { path: '/login', name: 'login', component: AuthView, meta: { title: 'Вход', guest: true } },
      { path: '/register', name: 'register', component: AuthView, meta: { title: 'Регистрация', guest: true } },
      { path: '/account', name: 'account', component: AccountView, meta: { title: 'Личный кабинет', private: true } },
      { path: '/history', name: 'history', component: HistoryView, meta: { title: 'История бронирований', private: true } },
      { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
    ],
    scrollBehavior(to, from, position) {
      return position ?? (to.hash ? { el: to.hash } : { top: 0 });
    },
  });
  router.beforeEach(to => {
    const { user } = useSessionStore(pinia);
    if (to.meta.private && !user) return { name: 'login', query: { next: to.fullPath } };
    if (to.meta.guest && user) return { name: 'account' };
    return undefined;
  });
  return router;
}
