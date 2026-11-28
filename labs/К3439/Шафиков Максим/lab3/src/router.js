import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'catalog', component: () => import('./views/CatalogView.vue'), meta: { title: 'Тренировки' } },
  { path: '/workouts/:id', name: 'workout', component: () => import('./views/WorkoutView.vue'), meta: { title: 'Тренировка' } },
  { path: '/blog', name: 'blog', component: () => import('./views/BlogView.vue'), meta: { title: 'Журнал' } },
  { path: '/blog/:id', name: 'article', component: () => import('./views/ArticleView.vue'), meta: { title: 'Статья' } },
  { path: '/account', name: 'account', component: () => import('./views/AccountView.vue'), meta: { title: 'Личный кабинет' } },
  { path: '/login', name: 'login', component: () => import('./views/AuthView.vue'), meta: { title: 'Вход' } },
  { path: '/register', name: 'register', component: () => import('./views/AuthView.vue'), meta: { title: 'Регистрация' } },
  { path: '/index.html', redirect: { name: 'catalog' } },
  { path: '/workout.html', redirect: to => to.query.id ? workoutRoute(to.query.id) : { name: 'catalog' } },
  { path: '/blog.html', redirect: to => to.query.id ? articleRoute(to.query.id) : { name: 'blog' } },
  { path: '/account.html', redirect: to => ({ name: 'account', query: to.query }) },
  { path: '/login.html', redirect: to => ({ name: 'login', query: to.query }) },
  { path: '/register.html', redirect: to => ({ name: 'register', query: to.query }) },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundView.vue'), meta: { title: 'Страница не найдена' } },
];

export const workoutRoute = id => ({ name: 'workout', params: { id } });
export const articleRoute = id => ({ name: 'article', params: { id } });
export const catalogRoute = { name: 'catalog', hash: '#catalog' };

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.hash) return { el: to.hash, top: 16 };
    if (to.path !== from.path || from.hash) return { top: 0 };
  },
});
