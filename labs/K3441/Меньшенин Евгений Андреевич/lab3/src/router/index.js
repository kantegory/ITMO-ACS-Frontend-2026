import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "../composables/useAuth.js";
import HomeView from "../views/HomeView.vue";
import CatalogView from "../views/CatalogView.vue";
import RecipeView from "../views/RecipeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import ProfileView from "../views/ProfileView.vue";
import CommunityView from "../views/CommunityView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/recipes", name: "catalog", component: CatalogView },
  { path: "/recipes/:id", name: "recipe", component: RecipeView, props: true },
  { path: "/community", name: "community", component: CommunityView },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
    meta: { guestOnly: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});
router.beforeEach((to) => {
  const { isAuthenticated } = useAuth();
  if (to.meta.requiresAuth && !isAuthenticated.value)
    return { name: "login", query: { redirect: to.fullPath } };
  if (to.meta.guestOnly && isAuthenticated.value) return { name: "profile" };
});

export default router;
