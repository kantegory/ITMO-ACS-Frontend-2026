<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="container py-5">
    <div class="empty-state my-5">
      <h1 class="fs-3">Такой страницы нет</h1>
      <p class="text-muted-2">Проверьте адрес или вернитесь к поиску жилья.</p>
      <RouterLink class="btn btn-primary" :to="{ name: 'home' }">На главную</RouterLink>
    </div>
  </div>
</template>
