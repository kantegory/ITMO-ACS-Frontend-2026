import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: "/",
      name: "catalog",
      component: () => import("../views/CatalogView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/AuthView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/AuthView.vue"),
    },
    {
      path: "/restaurants/:id",
      name: "restaurant",
      component: () => import("../views/RestaurantView.vue"),
      props: true,
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.restore();
  if (to.meta.requiresAuth && !auth.user)
    return { name: "login", query: { redirect: to.fullPath } };
});
export default router;
