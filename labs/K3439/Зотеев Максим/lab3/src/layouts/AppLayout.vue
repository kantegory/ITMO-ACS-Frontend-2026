<script setup>
import AppHeader from '@/components/common/AppHeader.vue'

defineProps({
  mainClass: { type: String, default: 'container py-4' },
})
</script>

<template>
  <a class="visually-hidden-focusable skip-link" href="#main">
    Перейти к основному содержимому
  </a>
  <AppHeader />
  <main id="main" tabindex="-1" :class="mainClass">
    <slot />
  </main>
</template>
