import { createRouter, createWebHistory } from "vue-router";
import NotesPage from "../views/NotesPage.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", name: "notes", component: NotesPage }],
});
