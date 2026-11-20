import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: "/",
      component: () => import("../views/HomeView.vue"),
      meta: { title: "Главная" },
    },
    {
      path: "/workouts",
      component: () => import("../views/WorkoutsView.vue"),
      meta: { title: "Тренировки" },
    },
    {
      path: "/workouts/:id",
      component: () => import("../views/WorkoutView.vue"),
      meta: { title: "Тренировка" },
    },
    {
      path: "/blog",
      component: () => import("../views/BlogView.vue"),
      meta: { title: "Блог" },
    },
    {
      path: "/blog/:id",
      component: () => import("../views/ArticleView.vue"),
      meta: { title: "Статья" },
    },
    {
      path: "/login",
      component: () => import("../views/AuthView.vue"),
      meta: { title: "Вход" },
    },
    {
      path: "/register",
      component: () => import("../views/AuthView.vue"),
      meta: { title: "Регистрация" },
    },
    {
      path: "/account",
      component: () => import("../views/AccountView.vue"),
      meta: { title: "Мой прогресс", requiresAuth: true },
    },
    {
      path: "/history",
      component: () => import("../views/HistoryView.vue"),
      meta: { title: "История", requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      component: () => import("../views/NotFoundView.vue"),
      meta: { title: "Страница не найдена" },
    },
  ],
});
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return;
  const auth = useAuthStore();
  if (auth.authenticated) {
    try {
      if (await auth.validate()) return;
    } catch {
      return;
    }
  }
  return { path: "/login", query: { next: to.fullPath } };
});
router.afterEach((to) => {
  document.title = to.meta.title + " - Fitness Platform";
});
export default router;
