<script setup>
import { useRouter } from 'vue-router';
import { cabinet, useSession } from './composables/useSession.js';

const router = useRouter();
const { user, logout, sessionError } = useSession();

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
    <a class="visually-hidden-focusable position-absolute bg-white p-2" href="#main" @click.prevent="skipToContent">К содержимому</a>
    <header class="site-header">
      <div class="container d-flex justify-content-between align-items-center flex-wrap gap-3 py-3">
        <RouterLink class="wordmark" :to="{ name: 'catalog' }" aria-label="Вектор — вакансии">
          <span aria-hidden="true">В</span> Вектор
        </RouterLink>
        <nav class="site-nav d-flex align-items-center flex-wrap" aria-label="Главное меню">
          <RouterLink :to="{ name: 'catalog' }">Вакансии</RouterLink>
          <template v-if="user">
            <RouterLink class="btn btn-outline-primary" :to="cabinet(user.role)">Мой кабинет</RouterLink>
            <button class="btn btn-outline-secondary" type="button" @click="signOut">Выйти</button>
          </template>
          <template v-else>
            <RouterLink class="btn btn-outline-primary" :to="{ name: 'login' }">Войти</RouterLink>
            <RouterLink class="btn btn-primary" :to="{ name: 'register' }">Регистрация</RouterLink>
          </template>
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
