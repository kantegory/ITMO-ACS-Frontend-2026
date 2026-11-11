import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // массив с маршрутами
  routes: [
    {
      path: '/',
      name: 'notes',
      // ленивая загрузка: код страницы скачивается, только когда её открывают
      component: () => import('../views/NotesPage.vue')
    }
  ]
})

// экспортируем настроенный роутер
export default router
