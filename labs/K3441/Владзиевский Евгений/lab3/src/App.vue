<script setup>
import { onMounted, watch } from 'vue';
import { RouterView } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import AppToasts from './components/AppToasts.vue';
import { useAuth } from './composables/useAuth.js';
import { useFavorites } from './composables/useFavorites.js';

const { user } = useAuth();
const { load: loadFavorites, reset: resetFavorites } = useFavorites();

onMounted(loadFavorites);

// Сменился пользователь (вошёл, вышел) — избранное перечитываем
watch(user, (value) => {
  resetFavorites();
  if (value) loadFavorites(true);
});
</script>

<template>
  <a class="skip-link" href="#main">Перейти к содержанию</a>

  <AppHeader />

  <main id="main" tabindex="-1">
    <!-- Каждая страница монтируется заново: своё состояние у объявления
         с id=1 и id=2 не должно смешиваться, отсюда :key -->
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.fullPath" />
    </RouterView>
  </main>

  <AppFooter />
  <AppToasts />
</template>
