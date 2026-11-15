<script setup>
import { computed } from 'vue';
import { TYPE_NAMES } from '../data/listings.js';

// defineModel — короткая запись для v-model: родитель пишет
// <FilterPanel v-model:query="…" v-model:type="…">, а здесь это обычные
// изменяемые ссылки. Под капотом всё те же props + emit('update:…').
const query = defineModel('query', { type: String, default: '' });
const type = defineModel('type', { type: String, default: 'all' });
const maxPrice = defineModel('maxPrice', { type: Number, default: 200000 });

const emit = defineEmits(['reset']);

const types = computed(() => [
  { value: 'all', label: 'Любой' },
  ...Object.entries(TYPE_NAMES).map(([value, label]) => ({ value, label }))
]);

const priceLabel = computed(() => maxPrice.value.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽');
</script>

<template>
  <form class="filters" @submit.prevent>
    <div class="field">
      <label for="f-query">Район или название</label>
      <input id="f-query" v-model.trim="query" type="search" placeholder="Например, Петроградский">
    </div>

    <div class="field">
      <label for="f-type">Тип жилья</label>
      <select id="f-type" v-model="type">
        <option v-for="option in types" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <div class="field">
      <label for="f-price">Цена до {{ priceLabel }}</label>
      <input id="f-price" v-model.number="maxPrice" type="range" min="20000" max="200000" step="5000">
    </div>

    <button class="reset" type="button" @click="emit('reset')">Сбросить</button>
  </form>
</template>

<style scoped>
.filters {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  align-items: end;
  padding: 1.1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.field {
  display: grid;
  gap: 0.35rem;
}

label {
  font-size: 0.88rem;
  color: var(--muted);
}

input,
select {
  font: inherit;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
}

input[type='range'] {
  padding: 0;
  border: 0;
  accent-color: var(--cobalt);
}

.reset {
  font: inherit;
  padding: 0.55rem 1rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}

.reset:hover {
  border-color: var(--cobalt);
  color: var(--cobalt);
}
</style>
