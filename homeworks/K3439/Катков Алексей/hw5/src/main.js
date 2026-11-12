import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'
import App from './App.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', name: 'notes', component: () => import('./views/NotesPage.vue') }],
})

createApp(App).use(createPinia()).use(router).mount('#app')
