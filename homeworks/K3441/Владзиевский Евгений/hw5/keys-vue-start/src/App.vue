<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import TheHeader from './components/TheHeader.vue';
import FilterPanel from './components/FilterPanel.vue';
import ListingList from './components/ListingList.vue';
import { listings as allListings, formatPrice } from './data/listings.js';

const FAVORITES_KEY = 'keys-vue-start:favorites';
const DEFAULT_MAX_PRICE = 200000;

// ref — реактивное значение: поменяли .value, шаблон перерисовался сам
const query = ref('');
const type = ref('all');
const maxPrice = ref(DEFAULT_MAX_PRICE);
const favorites = ref([]);

// computed пересчитывается, только когда меняется то, от чего он зависит
const visibleListings = computed(() => allListings.filter((listing) => {
  if (type.value !== 'all' && listing.type !== type.value) return false;
  if (listing.price > maxPrice.value) return false;
  if (!query.value) return true;
  const haystack = `${listing.title} ${listing.district} ${listing.city}`.toLowerCase();
  return haystack.includes(query.value.toLowerCase());
}));

const averagePrice = computed(() => {
  if (visibleListings.value.length === 0) return null;
  const sum = visibleListings.value.reduce((total, listing) => total + listing.price, 0);
  return formatPrice(Math.round(sum / visibleListings.value.length));
});

function toggleFavorite(id) {
  favorites.value = favorites.value.includes(id)
    ? favorites.value.filter((item) => item !== id)
    : [...favorites.value, id];
}

function resetFilters() {
  query.value = '';
  type.value = 'all';
  maxPrice.value = DEFAULT_MAX_PRICE;
}

// onMounted срабатывает, когда компонент уже в документе
onMounted(() => {
  try {
    favorites.value = JSON.parse(localStorage.getItem(FAVORITES_KEY)) ?? [];
  } catch {
    favorites.value = [];
  }
});

// watch следит за значением и запускает побочный эффект
watch(favorites, (value) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(value));
  } catch {
    // приватный режим — просто не сохраняем
  }
}, { deep: true });
</script>

<template>
  <TheHeader title="Ключи" :favorites-count="favorites.length" />

  <main class="page">
    <h1>Поиск жилья</h1>
    <p class="lead">
      Учебное приложение к ДЗ5: разбираемся с компонентами, пропсами, событиями и v-model.
    </p>

    <FilterPanel
      v-model:query="query"
      v-model:type="type"
      v-model:max-price="maxPrice"
      @reset="resetFilters"
    />

    <p class="summary">
      Найдено: <strong>{{ visibleListings.length }}</strong>
      <template v-if="averagePrice"> · средняя цена {{ averagePrice }}</template>
    </p>

    <ListingList
      :listings="visibleListings"
      :favorites="favorites"
      @toggle-favorite="toggleFavorite"
    />
  </main>
</template>

<style scoped>
.page {
  max-width: 1040px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
  display: grid;
  gap: 1.25rem;
}

h1 {
  margin: 0;
  font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.2rem);
}

.lead,
.summary {
  margin: 0;
  color: var(--muted);
}

.summary strong {
  color: var(--ink);
}
</style>
