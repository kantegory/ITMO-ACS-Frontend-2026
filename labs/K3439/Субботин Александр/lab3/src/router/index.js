import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import { SITE_NAME } from '@/composables/usePageTitle'
import HomeView from '@/views/HomeView.vue'

const DEFAULT_TITLE = 'Столик — бронирование столиков в ресторанах Петербурга'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // RouterLink текущей страницы получает класс Bootstrap .active (и aria-current="page")
  linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/restaurants',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { title: 'Рестораны' },
    },
    {
      path: '/restaurants/:id(\\d+)',
      name: 'restaurant',
      component: () => import('@/views/RestaurantView.vue'),
      props: (route) => ({ id: Number(route.params.id) }),
      meta: { title: 'Ресторан' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: 'Вход', guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: 'Регистрация', guestOnly: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { title: 'Личный кабинет', requiresAuth: true },
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: () => import('@/views/BookingsView.vue'),
      meta: { title: 'История бронирований', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Страница не найдена' },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // Ссылки вида /profile#favorites ведут к разделу страницы
    if (to.hash && document.querySelector(to.hash)) return { el: to.hash }
    // Поменялись только фильтры поиска в адресе — страницу не дёргаем
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

// Адрес после входа (?next=/bookings). Пропускаем только пути внутри сайта, чтобы ссылкой
// нельзя было увести на чужой сайт
export function safeRedirect(next) {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//')) return { name: 'profile' }
  return next
}

// Закрытые страницы: без входа отправляем на вход и возвращаем обратно после него.
// Вход и регистрация вошедшему пользователю не нужны
router.beforeEach((to) => {
  const { isLoggedIn } = useAuth()
  if (to.meta.requiresAuth && !isLoggedIn.value) return { name: 'login', query: { next: to.fullPath } }
  if (to.meta.guestOnly && isLoggedIn.value) return safeRedirect(to.query.next)
})

router.afterEach((to, from) => {
  document.title = to.meta.title ? `${to.meta.title} — ${SITE_NAME}` : DEFAULT_TITLE

  // При переходе на другую страницу фокус остаётся на нажатой ссылке, а её уже нет.
  // Переносим его на начало содержимого — скринридер начнёт читать новую страницу
  if (from.matched.length && to.path !== from.path) {
    nextTick(() => document.querySelector('#main')?.focus({ preventScroll: true }))
  }
})

export default router
