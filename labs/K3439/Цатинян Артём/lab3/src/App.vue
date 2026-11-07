<script setup>
import AppHeader from "./components/AppHeader.vue";
import ThemeToggle from "./components/ThemeToggle.vue";
</script>
<template>
  <a class="skip-link" href="#main-content">Перейти к основному содержимому</a
  ><AppHeader /><RouterView />
  <footer>
    <div class="container d-flex justify-content-between flex-wrap gap-2">
      <b>tablely.</b><span>Санкт-Петербург · 2026</span>
    </div>
  </footer>
  <ThemeToggle />
</template>
