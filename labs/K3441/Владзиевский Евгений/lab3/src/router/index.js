// Роутер: адреса, ленивая загрузка страниц и защита личных разделов.

import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Ключи | аренда квартир и домов без посредников' }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchView.vue'),
    meta: { title: 'Поиск жилья | Ключи' }
  },
  {
    path: '/property/:id',
    name: 'property',
    component: () => import('../views/PropertyView.vue'),
    props: true,
    meta: { title: 'Объявление | Ключи' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Вход | Ключи', guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { title: 'Регистрация | Ключи', guestOnly: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { title: 'Личный кабинет | Ключи', requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'messages',
    component: () => import('../views/MessagesView.vue'),
    meta: { title: 'Сообщения и сделки | Ключи', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Страница не найдена | Ключи' }
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.hash) return { el: to.hash };
    return { top: 0 };
  }
});

// Личный кабинет и сообщения — только своим. Куда хотели попасть,
// запоминаем в ?next=, чтобы вернуть туда после входа.
router.beforeEach((to) => {
  const { isLogged } = useAuth();

  if (to.meta.requiresAuth && !isLogged.value) {
    return { name: 'login', query: { next: to.fullPath } };
  }
  if (to.meta.guestOnly && isLogged.value) {
    return { name: 'profile' };
  }
  return true;
});

// Заголовок вкладки задаёт сам маршрут
router.afterEach((to) => {
  if (to.meta.title) document.title = to.meta.title;
});
