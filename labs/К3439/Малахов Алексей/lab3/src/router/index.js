import { createRouter, createWebHistory } from 'vue-router'

import useAuthStore from '@/stores/auth'

const toNumber = (route) => ({ id: Number(route.params.id) })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'Главная' },
    },
    {
      path: '/recipes',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
      meta: { title: 'Поиск рецептов' },
    },
    {
      path: '/recipes/:id(\\d+)',
      name: 'recipe',
      component: () => import('../views/RecipeView.vue'),
      props: toNumber,
      meta: { title: 'Рецепт' },
    },
    {
      path: '/authors/:id(\\d+)',
      name: 'author',
      component: () => import('../views/AuthorView.vue'),
      props: toNumber,
      meta: { title: 'Кулинар' },
      beforeEnter: (to) => {
        const auth = useAuthStore()
        if (auth.isAuthenticated && auth.userId === Number(to.params.id))
          return { name: 'profile' }
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { title: 'Личный кабинет', requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Вход', guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { title: 'Регистрация', guestOnly: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: 'Страница не найдена' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (auth.token && !auth.isAuthenticated) auth.logout()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    const redirect = to.query.redirect
    return typeof redirect === 'string' &&
      redirect.startsWith('/') &&
      !redirect.startsWith('//')
      ? redirect
      : { name: 'profile' }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title}: Вкусная лента`
})

export default router
