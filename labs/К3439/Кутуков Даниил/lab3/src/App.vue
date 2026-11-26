<script setup>
import { nextTick, ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import SiteHeader from './components/SiteHeader.vue';

const main = ref(null);
const route = useRoute();

watch(() => route.path, async (path, previous) => {
  document.title = (route.meta.title || 'Страница не найдена') + ' · Столик';
  if (previous && path !== previous) {
    await nextTick();
    main.value?.focus({ preventScroll: true });
  }
}, { immediate: true, flush: 'post' });
</script>

<template>
  <a href="#main" class="skip-link" @click="main?.focus()">Перейти к содержимому</a>
  <SiteHeader />
  <main id="main" ref="main" class="container-xl" tabindex="-1">
    <RouterView v-slot="{ Component }"><component :is="Component" :key="route.path" /></RouterView>
  </main>
  <footer class="site-footer">
    <div class="container-xl">
      <RouterLink to="/" class="wordmark">Столик<span class="brand-dot">.</span></RouterLink>
      <p>Бронирование ресторанов Санкт-Петербурга</p>
      <small>Учебный проект · Даниил Кутуков</small>
    </div>
  </footer>
</template>
