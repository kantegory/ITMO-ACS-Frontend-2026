<script setup>
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
</script>

<template>
  <a class="skip-link" href="#main">Перейти к основному содержимому</a>
  <AppHeader />
  <main id="main" tabindex="-1" class="flex-grow-1">
    <!-- key: при переходе между ресторанами (/restaurants/1 → /restaurants/2) страница создаётся заново -->
    <RouterView :key="$route.path" />
  </main>
  <AppFooter />
  <ToastContainer />
</template>
