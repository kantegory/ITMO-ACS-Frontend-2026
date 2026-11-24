import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { cabinet, useSession } from './composables/useSession.js';
import CatalogView from './views/CatalogView.vue';
import JobView from './views/JobView.vue';
import AuthView from './views/AuthView.vue';
import ProfileView from './views/ProfileView.vue';
import EmployerView from './views/EmployerView.vue';
import NotFoundView from './views/NotFoundView.vue';

const routes = [
  { path: '/', name: 'catalog', component: CatalogView, meta: { title: 'Вакансии' } },
  { path: '/jobs/:id([a-zA-Z0-9-]+)', name: 'job', component: JobView, meta: { title: 'Вакансия' } },
  { path: '/login', name: 'login', component: AuthView, props: { mode: 'login' }, meta: { title: 'Вход', guest: true } },
  { path: '/register', name: 'register', component: AuthView, props: { mode: 'register' }, meta: { title: 'Регистрация', guest: true } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { title: 'Кабинет соискателя', role: 'applicant' } },
  { path: '/employer', name: 'employer', component: EmployerView, meta: { title: 'Кабинет работодателя', role: 'employer' } },
  { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: 'Страница не найдена' } }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, saved) {
    return saved ?? { top: 0 };
  }
});

router.beforeEach(async to => {
  const { user, restore } = useSession();
  await restore();
  if (to.meta.role && !user.value) return { name: 'login' };
  if (user.value && (to.meta.guest || (to.meta.role && to.meta.role !== user.value.role))) {
    return cabinet(user.value.role);
  }
});

router.afterEach(async (to, from, failure) => {
  if (failure) return;
  document.title = `${to.meta.title} | Вектор`;
  if (from.name && from.path !== to.path) {
    await nextTick();
    document.getElementById('main')?.focus({ preventScroll: true });
  }
});

export default router;
