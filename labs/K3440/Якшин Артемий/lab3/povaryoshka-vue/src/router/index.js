import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import useAuthStore from '@/stores/auth'

// числовой id из адреса передаём в страницу как свойство
const idProp = (route) => ({ id: Number(route.params.id) })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Bootstrap подсвечивает активный пункт меню классом active
  linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { title: 'Рецепты от домашних поваров' }
    },
    {
      path: '/recipes/:id(\\d+)',
      name: 'recipe',
      component: () => import('@/views/RecipeView.vue'),
      props: idProp,
      meta: { title: 'Рецепт' }
    },
    {
      path: '/cooks',
      name: 'cooks',
      component: () => import('@/views/CooksView.vue'),
      meta: { title: 'Кулинары' }
    },
    {
      path: '/cooks/:id(\\d+)',
      name: 'author',
      component: () => import('@/views/AuthorView.vue'),
      props: idProp,
      meta: { title: 'Кулинар' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { title: 'Личный кабинет', requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: 'Вход', guestOnly: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: 'Регистрация', guestOnly: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Страница не найдена' }
    }
  ],
  // при переходе на новую страницу — наверх, при «назад» — туда, где были
  scrollBehavior: (to, from, savedPosition) => savedPosition ?? { top: 0 }
})

// navigation guard: кабинет только для вошедших, вход и регистрация — только для гостей
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'profile' }
  }
})

router.afterEach((to, from) => {
  document.title = `${to.meta.title} — Поварёшка`
  // после перехода переносим фокус на контент: скринридер поймёт, что страница сменилась
  if (from.matched.length) {
    nextTick(() => document.getElementById('main')?.focus({ preventScroll: true }))
  }
})

export default router
