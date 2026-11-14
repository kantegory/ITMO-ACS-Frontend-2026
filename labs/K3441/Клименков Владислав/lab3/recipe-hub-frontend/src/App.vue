<script setup>
/**
 * App.vue — общий каркас SPA: skip-link, шапка, контент, подвал
 * и единый live-region для озвучивания динамических сообщений.
 */

import { onMounted } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import ApiStatusBanner from '@/components/ApiStatusBanner.vue';
import { useLiveRegion } from '@/composables/useLiveRegion';
import { useCatalogStore } from '@/stores/catalog';

const { message } = useLiveRegion();
const catalog = useCatalogStore();

// Справочник пользователей нужен карточкам рецептов и комментариям
// на разных страницах, поэтому загружаем его один раз для всего приложения.
onMounted(() => {
  catalog.loadUsers().catch((error) => {
    console.error('RecipeHub: не удалось загрузить пользователей', error);
  });
});
</script>

<template>
  <a
    class="visually-hidden-focusable position-absolute top-0 start-0 m-2 p-2 bg-body text-body border rounded z-3"
    href="#main-content"
  >
    Перейти к основному содержимому
  </a>

  <AppHeader />
  <ApiStatusBanner />
  <RouterView />
  <AppFooter />

  <div
    class="visually-hidden"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    {{ message }}
  </div>
</template>
