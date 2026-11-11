<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast show align-items-center border-0"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">{{ toast.message }}</div>
        <button class="btn-close me-2 m-auto" type="button" aria-label="Закрыть уведомление" @click="removeToast(toast.id)" />
      </div>
    </div>
  </div>
</template>
