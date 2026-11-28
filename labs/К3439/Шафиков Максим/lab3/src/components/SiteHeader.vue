<script setup>
import { useRouter } from 'vue-router';
import AppIcon from './AppIcon.vue';
import { useTheme } from '../composables/useTheme.js';
import { useSession } from '../composables/useSession.js';
import { useAction } from '../composables/useAction.js';

const router = useRouter();
const theme = useTheme();
const { profile, restoring, logout } = useSession();
const { pending, error, run } = useAction();

const links = [
  { name: 'catalog', label: 'Тренировки', pages: ['catalog', 'workout'] },
  { name: 'blog', label: 'Журнал', pages: ['blog', 'article'] },
  { name: 'account', label: 'Личный кабинет', pages: ['account'] },
];

function signOut() {
  return run(logout, () => router.push({ name: 'catalog' }));
}
</script>

<template>
  <header class="site-header">
    <div class="container site-width header-inner">
      <RouterLink class="wordmark" :to="{ name: 'catalog' }" aria-label="Качалочка, главная">
        <img class="brand-logo" src="/assets/images/logo.png" alt="" width="36" height="36">
        Качалочка
      </RouterLink>

      <nav class="main-nav" aria-label="Основное меню">
        <RouterLink v-for="link in links" :key="link.name" :to="{ name: link.name }" custom v-slot="{ href, navigate }">
          <a :href="href" :aria-current="link.pages.includes($route.name) ? 'page' : undefined" @click="navigate">
            {{ link.label }}
          </a>
        </RouterLink>
      </nav>

      <div class="header-tools">
        <div class="theme-control">
          <label for="theme-select">
            <AppIcon name="theme" />
            <span class="visually-hidden">Цветовая тема</span>
          </label>
          <select id="theme-select" v-model="theme" class="form-select">
            <option value="auto">Системная</option>
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </div>
        <div class="header-actions">
          <button v-if="profile" class="btn btn-outline-secondary" type="button" :disabled="pending" @click="signOut">
            Выйти
          </button>
          <RouterLink v-else-if="!restoring" class="btn btn-outline-secondary" :to="{ name: 'login' }">Войти</RouterLink>
        </div>
      </div>
    </div>
    <p v-if="error" class="container site-width form-error pb-2 mb-0" role="alert">{{ error }}</p>
  </header>
</template>
