import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const SITE_NAME = 'Аренда жилья'

// Разрешаем возврат только на внутренние маршруты SPA, чтобы next нельзя было подменить внешней ссылкой
export function getSafeNextPath(next, fallback = '/profile') {
  if (typeof next !== 'string') return fallback
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  if (next === '/login' || next.startsWith('/login?') || next === '/register' || next.startsWith('/register?')) {
    return fallback
  }
  return next
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { title: 'Поиск жилья' },
    },
    {
      path: '/properties/:id',
      name: 'property',
      component: () => import('@/views/PropertyView.vue'),
      meta: { title: 'Объявление' },
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
      path: '/messages',
      name: 'messages',
      component: () => import('@/views/MessagesView.vue'),
      meta: { title: 'Сообщения и сделки', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Страница не найдена' },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { next: to.fullPath },
    }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return getSafeNextPath(to.query.next, '/profile')
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — ${SITE_NAME}` : SITE_NAME
})

export default router
