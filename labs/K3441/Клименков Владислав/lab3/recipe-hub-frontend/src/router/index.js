/**
 * router/index.js — клиентская маршрутизация SPA.
 *
 * Навигационные guards проверяют авторизацию до отображения страницы:
 *  - meta.requiresAuth — только для вошедших (личный кабинет);
 *  - meta.guestOnly  — только для гостей (вход и регистрация).
 * После перехода обновляется title и фокус переносится на <main>.
 */

import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import SearchView from '@/views/SearchView.vue';
import RecipeView from '@/views/RecipeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import ProfileView from '@/views/ProfileView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Главная' },
  },
  {
    path: '/search',
    name: 'search',
    component: SearchView,
    meta: { title: 'Поиск рецептов' },
  },
  {
    path: '/recipe/:id',
    name: 'recipe',
    component: RecipeView,
    props: true,
    meta: { title: 'Рецепт' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Вход', guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: 'Регистрация', guestOnly: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { title: 'Личный кабинет', requiresAuth: true },
  },

  // Совместимость со старыми адресами MPA-версии.
  { path: '/index.html', redirect: '/' },
  { path: '/pages/login.html', redirect: '/login' },
  { path: '/pages/register.html', redirect: '/register' },
  { path: '/pages/profile.html', redirect: '/profile' },
  {
    path: '/pages/search.html',
    redirect: (to) => ({ name: 'search', query: to.query }),
  },
  {
    path: '/pages/recipe.html',
    redirect: (to) =>
      to.query.id
        ? { name: 'recipe', params: { id: String(to.query.id) } }
        : { name: 'search' },
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Страница не найдена' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.ensureRestored();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'profile' };
  }

  return true;
});

router.afterEach((to, from) => {
  document.title = to.meta.title
    ? `${to.meta.title} — RecipeHub`
    : 'RecipeHub — сервис обмена рецептами';

  // При первом открытии фокус не перехватываем.
  if (!from.name) return;

  nextTick(() => {
    document.getElementById('main-content')?.focus({ preventScroll: true });
  });
});

export default router;
