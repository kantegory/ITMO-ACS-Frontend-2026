<script setup>
import { nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SiteHeader from './components/SiteHeader.vue';
import { useSession } from './composables/useSession.js';

const route = useRoute();
const main = ref(null);
const { restore, sessionError } = useSession();
void restore();

watch(() => route.path, async (_, previous) => {
  await nextTick();
  if (previous && !route.hash) main.value?.focus({ preventScroll: true });
});

watch(() => route.path, () => {
  const title = route.meta.title;
  document.title = title ? title + ' — Качалочка' : 'Качалочка';
}, { immediate: true });
</script>

<template>
  <a class="skip-link" href="#main" @click.prevent="main.focus()">К содержимому</a>
  <SiteHeader />
  <main id="main" ref="main" tabindex="-1">
    <div v-if="sessionError" class="container site-width pt-3">
      <p class="form-error" role="alert">{{ sessionError }}</p>
      <button class="btn btn-outline-secondary" type="button" @click="restore">Повторить проверку сессии</button>
    </div>
    <RouterView v-slot="{ Component, route: current }">
      <component :is="Component" :key="current.path" />
    </RouterView>
  </main>
  <footer class="site-footer">
    <div class="container site-width footer-inner">
      <RouterLink class="wordmark" :to="{ name: 'catalog' }">Качалочка</RouterLink>
    </div>
  </footer>
</template>
