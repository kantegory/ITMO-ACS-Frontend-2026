<script setup>
defineProps({
  pending: Boolean,
  error: { type: String, default: '' },
});
defineEmits(['retry']);
</script>

<template>
  <p v-if="pending" class="muted" role="status">Загрузка…</p>
  <div v-else-if="error">
    <p class="form-error" role="alert">{{ error }}</p>
    <button class="btn btn-outline-secondary" type="button" @click="$emit('retry')">Повторить</button>
  </div>
  <slot v-else />
</template>
