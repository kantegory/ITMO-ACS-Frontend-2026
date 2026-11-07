import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'notes',
      // ленивая подгрузка: код страницы скачивается только при первом переходе на неё
      component: () => import('../views/NotesPage.vue'),
    },
  ],
})

export default router
