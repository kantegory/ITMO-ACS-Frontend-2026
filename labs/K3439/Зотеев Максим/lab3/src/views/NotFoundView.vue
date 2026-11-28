<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
</script>

<template>
  <AppLayout main-class="container py-5 text-center">
    <h1 class="display-5 fw-bold mb-3">404</h1>
    <p class="text-muted mb-4">Запрошенная страница не найдена.</p>
    <RouterLink class="btn btn-primary" :to="{ name: 'search' }">
      Вернуться к поиску жилья
    </RouterLink>
  </AppLayout>
</template>
