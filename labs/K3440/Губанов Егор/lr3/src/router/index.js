import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../state/session.js'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', name: 'catalog', component: () => import('../views/CatalogView.vue'), meta: { title: 'Занятия' } },
        { path: '/trainings/:id', name: 'training', component: () => import('../views/TrainingView.vue'), meta: { title: 'Тренировка' } },
        { path: '/login', name: 'login', component: () => import('../views/AuthView.vue'), props: { mode: 'login' }, meta: { title: 'Вход' } },
        { path: '/register', name: 'register', component: () => import('../views/AuthView.vue'), props: { mode: 'register' }, meta: { title: 'Регистрация' } },
        { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { title: 'Мой план', requiresAuth: true } },
        { path: '/session/:id', name: 'session', component: () => import('../views/SessionView.vue'), meta: { title: 'Комната занятия', requiresAuth: true } },
        { path: '/blog', name: 'blog', component: () => import('../views/BlogView.vue'), meta: { title: 'Блог' } },
        { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue'), meta: { title: 'Страница не найдена' } }
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        if (to.name === 'catalog' && from.name === 'catalog' && to.path === from.path) return false
        return { top: 0 }
    }
})

router.beforeEach(to => {
    if (to.meta.requiresAuth && !isAuthenticated.value) {
        return { name: 'login', query: { next: to.fullPath } }
    }
})

router.afterEach(to => {
    document.title = `${to.meta.title || 'Вместе'} — Вместе`
})

export default router