<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, closeToast } = useToast()
</script>

<template>
  <!-- Контейнер — live-область, и он есть на странице всегда: скринридер объявляет только изменения
       внутри уже существующей области, а не элемент, вставленный вместе с текстом -->
  <div class="toast-container position-fixed bottom-0 end-0 p-3" aria-live="polite" aria-atomic="false">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast show align-items-center border-0"
      :class="`text-bg-${toast.variant}`"
    >
      <div class="d-flex">
        <div class="toast-body">{{ toast.message }}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Закрыть" @click="closeToast(toast.id)"></button>
      </div>
    </div>
  </div>
</template>
