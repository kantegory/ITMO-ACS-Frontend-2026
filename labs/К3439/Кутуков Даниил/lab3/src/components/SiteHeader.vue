<script setup>
import { RouterLink } from 'vue-router';
import { useSessionStore } from '../stores/session.js';
import { useTheme } from '../composables/useTheme.js';
import SiteIcon from './SiteIcon.vue';

const session = useSessionStore();
const { dark, toggle } = useTheme();
</script>

<template>
  <header class="site-header">
    <div class="container-xl header-inner">
      <RouterLink to="/" class="wordmark" aria-label="Столик — главная">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Столик<span class="brand-dot">.</span>
      </RouterLink>
      <nav class="top-nav" aria-label="Основная навигация">
        <RouterLink to="/">Рестораны</RouterLink>
        <RouterLink to="/history">Мои брони</RouterLink>
      </nav>
      <div class="header-actions">
        <button type="button" class="btn btn-outline-primary theme-button" :aria-pressed="dark" @click="toggle">Тёмная тема</button>
        <RouterLink :to="session.user ? '/account' : '/login'" class="btn btn-outline-primary header-account">
          <SiteIcon name="user" /> <span>{{ session.user ? 'Кабинет' : 'Войти' }}</span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>
