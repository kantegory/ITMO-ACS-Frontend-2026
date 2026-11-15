<script setup>
// Крошечный компонент ради слота: содержимое задаёт тот, кто его вставляет.
defineProps({
  tone: {
    type: String,
    default: 'neutral',
    validator: (value) => ['neutral', 'accent'].includes(value)
  }
});
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.badge--neutral {
  background: var(--paper);
  color: var(--muted);
}

.badge--accent {
  background: var(--cobalt-tint);
  color: var(--cobalt-dark);
}
</style>
