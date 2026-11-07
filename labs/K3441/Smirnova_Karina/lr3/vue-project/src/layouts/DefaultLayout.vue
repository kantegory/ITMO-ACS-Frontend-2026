<script setup>
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Перейти к основному содержимому</a>
    <AppHeader />
    <RouterView />
    <AppFooter />
  </div>
</template>
