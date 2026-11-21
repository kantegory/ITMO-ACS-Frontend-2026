<script setup>
defineProps({
  message: { type: String, default: '' },
  error: { type: Boolean, default: false }
})
</script>

<template>
  <div :role="error ? 'alert' : 'status'" aria-atomic="true">
    <p v-if="message" class="status" :class="{ 'is-error': error }">{{ message }}</p>
  </div>
</template>