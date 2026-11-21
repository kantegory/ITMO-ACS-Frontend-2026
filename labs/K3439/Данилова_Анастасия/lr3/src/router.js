import { createRouter, createWebHistory } from 'vue-router'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import CatalogView from './views/CatalogView.vue'
import AuthView from './views/AuthView.vue'
import PropertyView from './views/PropertyView.vue'
import ProfileView from './views/ProfileView.vue'
import MessagesView from './views/MessagesView.vue'

const { user, signOut } = useAuth()

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'catalog', component: CatalogView, meta: { title: 'Поиск' } },
    { path: '/properties/:id', name: 'property', component: PropertyView, meta: { title: 'Объявление' } },
    { path: '/login', name: 'login', component: AuthView, meta: { title: 'Вход' } },
    { path: '/register', name: 'register', component: AuthView, props: { registration: true }, meta: { title: 'Регистрация' } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { title: 'Личный кабинет', auth: true } },
    { path: '/messages', name: 'messages', component: MessagesView, meta: { title: 'Сообщения', auth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(to => {
  if (to.meta.auth && !user.value) return { name: 'login' }
})

router.afterEach(to => {
  document.title = to.meta.title + ' — Snimu'
})

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && user.value &&
      !['/login', '/register'].includes(error.config?.url)) {
    signOut()
    router.replace({ name: 'login' })
  }
  return Promise.reject(error)
})
