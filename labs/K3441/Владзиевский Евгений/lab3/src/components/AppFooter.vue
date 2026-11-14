<script setup>
import { RouterLink } from 'vue-router';

const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="container d-flex flex-wrap justify-content-between gap-3">
      <span>© {{ year }} Ключи. Учебный проект, ИТМО.</span>
      <nav class="d-flex flex-wrap gap-3" aria-label="Ссылки в подвале">
        <RouterLink :to="{ name: 'search' }">Поиск</RouterLink>
        <RouterLink :to="{ name: 'profile' }">Личный кабинет</RouterLink>
        <RouterLink :to="{ name: 'messages' }">Сделки</RouterLink>
        <RouterLink :to="{ name: 'login' }">Вход</RouterLink>
      </nav>
    </div>
  </footer>
</template>
