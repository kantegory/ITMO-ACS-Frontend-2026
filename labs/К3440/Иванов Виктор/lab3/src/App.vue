<script setup>
import { RouterView } from 'vue-router';
import SiteHeader from './components/SiteHeader.vue';
</script>
<template>
  <a class="skip-link" href="#main">Перейти к содержимому</a>
  <SiteHeader />
  <main id="main" class="container py-4" tabindex="-1"><RouterView /></main>
  <footer class="site-footer mt-5 py-4"><div class="container d-flex justify-content-between gap-2"><span>© 2026 Столик</span><span>Учебный проект · Санкт-Петербург</span></div></footer>
</template>
