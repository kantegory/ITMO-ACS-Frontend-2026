import { createRouter, createWebHistory } from 'vue-router';
import VacancyList from '../views/VacancyList.vue';

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: VacancyList, props: { savedOnly: false } },
    { path: '/saved', component: VacancyList, props: { savedOnly: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior: () => ({ top: 0 })
});
