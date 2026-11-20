<script setup>
defineProps({ loading: Boolean, error: { type: String, default: "" } });
defineEmits(["retry"]);
</script>
<template>
  <div class="request-state" aria-live="polite">
    <p v-if="loading" role="status">Загрузка…</p>
    <div v-else-if="error">
      <p class="form-error" role="alert">{{ error }}</p>
      <button class="btn btn-outline-dark" @click="$emit('retry')">
        Повторить
      </button>
    </div>
    <slot v-else />
  </div>
</template>
