<script setup>
// Шапка ничего не считает сама: что показать, ей передают пропсами.
defineProps({
  title: { type: String, required: true },
  favoritesCount: { type: Number, default: 0 }
});
</script>

<template>
  <header class="header">
    <a class="brand" href="#">
      <span class="brand-mark">К</span>
      {{ title }}
    </a>

    <p class="counter">
      В избранном:
      <strong>{{ favoritesCount }}</strong>
    </p>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--ink);
  text-decoration: none;
}

.brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--tag);
  color: #2b2200;
  display: grid;
  place-items: center;
}

.counter {
  margin: 0;
  color: var(--muted);
}

.counter strong {
  color: var(--ink);
}
</style>
