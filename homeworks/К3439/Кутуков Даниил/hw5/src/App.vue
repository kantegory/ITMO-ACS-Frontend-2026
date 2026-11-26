<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header class="border-bottom bg-white">
    <div class="container notebook-header">
      <RouterLink to="/notes" class="notebook-brand">Куда сходить<span>.</span></RouterLink>
      <nav aria-label="Основная навигация"><RouterLink to="/notes">Мои заметки</RouterLink></nav>
    </div>
  </header>
  <main class="container py-5"><RouterView /></main>
  <footer class="container pb-4 text-secondary">Учебный проект · Даниил Кутуков</footer>
</template>
