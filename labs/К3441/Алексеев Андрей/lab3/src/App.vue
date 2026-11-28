<script setup>
import { useRouter } from 'vue-router';
import SiteIcon from './components/SiteIcon.vue';
import { useTheme } from './composables/useTheme.js';
import { cabinet, useSession } from './composables/useSession.js';

const router = useRouter();
const { user, logout, sessionError } = useSession();
const { preference, setPreference } = useTheme();

async function signOut() {
  logout();
  await router.push({ name: 'catalog' });
}

function skipToContent() {
  const main = document.getElementById('main');
  main.focus();
  main.scrollIntoView({ block: 'start' });
}
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <a class="skip-link visually-hidden-focusable" href="#main" @click.prevent="skipToContent">К содержимому</a>
    <header class="site-header">
      <div class="container d-flex justify-content-between align-items-center flex-wrap gap-3 py-3">
        <RouterLink class="wordmark" :to="{ name: 'catalog' }">
          <span aria-hidden="true"><SiteIcon name="briefcase" /></span> Вектор
        </RouterLink>
        <nav class="site-nav d-flex align-items-center flex-wrap" aria-label="Главное меню">
          <RouterLink :to="{ name: 'catalog' }">Вакансии</RouterLink>
          <div class="d-flex align-items-center gap-2">
            <label for="theme-choice">Тема</label>
            <select id="theme-choice" class="form-select form-select-sm w-auto"
              :value="preference" @change="setPreference($event.target.value)">
              <option value="system">Системная</option>
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
            </select>
          </div>
          <div class="d-flex align-items-center flex-wrap gap-2">
            <template v-if="user">
              <RouterLink class="btn btn-outline-primary" :to="cabinet(user.role)"><SiteIcon name="account" /> Мой кабинет</RouterLink>
              <button class="btn btn-outline-secondary" type="button" @click="signOut"><SiteIcon name="sign-out" /> Выйти</button>
            </template>
            <template v-else>
              <RouterLink class="btn btn-outline-primary" :to="{ name: 'login' }">Войти</RouterLink>
              <RouterLink class="btn btn-primary" :to="{ name: 'register' }">Регистрация</RouterLink>
            </template>
          </div>
        </nav>
      </div>
    </header>
    <main id="main" class="container flex-grow-1 py-4 py-md-5" tabindex="-1">
      <p v-if="sessionError" class="alert alert-warning" role="alert">{{ sessionError }}</p>
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </RouterView>
    </main>
    <footer class="site-footer mt-4">
      <div class="container py-4">Вектор · Учебный сервис поиска работы</div>
    </footer>
  </div>
</template>
