/**
 * main.js — точка входа Vue-приложения RecipeHub.
 *
 * Здесь подключаются глобальные стили, Bootstrap (CSS + JS для модалок,
 * дропдаунов, табов и navbar), Pinia и Vue Router. Логика приложения
 * разложена по `api`, `stores`, `composables`, `components` и `views`.
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@/assets/css/variables.css';
import '@/assets/css/style.css';
import 'bootstrap';

import App from './App.vue';
import router from '@/router';
import { initTheme } from '@/composables/useTheme';

// Тема применяется до монтирования, чтобы не было вспышки светлого экрана.
initTheme();

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount('#app');
