<script setup>
import { useToasts } from '../composables/useToasts.js';

const { items, dismiss } = useToasts();
</script>

<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div
      v-for="item in items"
      :key="item.id"
      class="toast show align-items-center app-toast border-0"
      role="status"
      aria-live="polite"
    >
      <div class="d-flex">
        <div class="toast-body">{{ item.text }}</div>
        <button type="button" class="btn-close me-2 m-auto" aria-label="Закрыть" @click="dismiss(item.id)"></button>
      </div>
    </div>
  </div>
</template>
