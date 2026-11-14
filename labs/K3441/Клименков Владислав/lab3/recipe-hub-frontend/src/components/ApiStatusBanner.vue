<script setup>
/**
 * ApiStatusBanner.vue — сообщение, если моковый API недоступен.
 */

import { isApiOnline } from '@/api/client';
</script>

<template>
  <div v-if="!isApiOnline" class="container mt-3">
    <div class="alert alert-danger mb-0" role="alert">
      Не удалось подключиться к API. Запустите <code>npm run api</code>
      и обновите страницу.
    </div>
  </div>
</template>
