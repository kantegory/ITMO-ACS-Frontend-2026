<script setup>
defineProps({
  title: { type: String, required: true },
  text: { type: String, default: '' }
});
</script>

<template>
  <div class="empty-state">
    <h3 class="fs-5">{{ title }}</h3>
    <p v-if="text" class="text-muted-2">{{ text }}</p>
    <!-- кнопку или ссылку подставляет тот, кто вставил компонент -->
    <slot />
  </div>
</template>
