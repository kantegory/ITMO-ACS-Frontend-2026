<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div
      v-if="message"
      class="toast show text-bg-dark"
      role="alert"
      aria-live="assertive"
    >
      <div class="toast-body">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { useNotify } from '@/composables/useNotify'

const { message } = useNotify()
</script>
