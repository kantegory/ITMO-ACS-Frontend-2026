<script setup>
defineProps({
  text: { type: String, default: 'Загружаем…' },
})
</script>

<template>
  <div class="d-flex align-items-center gap-2 text-muted-warm py-4" role="status">
    <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    <span>{{ text }}</span>
  </div>
</template>
