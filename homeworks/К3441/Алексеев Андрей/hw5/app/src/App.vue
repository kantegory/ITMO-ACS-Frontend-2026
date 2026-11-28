<script setup>
import { onMounted } from 'vue';
import { useVacancies } from './stores/vacancies.js';

const catalog = useVacancies();
onMounted(catalog.load);
</script>

<template>
  <header class="site-header">
    <nav class="container d-flex align-items-center justify-content-between flex-wrap gap-3 py-3" aria-label="Главное меню">
      <RouterLink class="wordmark" to="/">Вектор</RouterLink>
      <div class="d-flex align-items-center gap-3">
        <RouterLink to="/">Каталог</RouterLink>
        <RouterLink to="/saved">Избранное ({{ catalog.savedIds.length }})</RouterLink>
      </div>
    </nav>
  </header>
  <main class="container py-4" id="content">
    <RouterView />
  </main>
</template>
