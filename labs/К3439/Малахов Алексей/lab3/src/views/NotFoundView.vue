<template>
  <base-layout>
    <div class="empty-state">
      <h1 class="h3">Страница не найдена</h1>
      <p><router-link :to="{ name: 'home' }">На главную</router-link></p>
    </div>
  </base-layout>
</template>

<script setup>
import BaseLayout from '@/layouts/BaseLayout.vue'
</script>
