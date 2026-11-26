<script setup>
import { computed, ref, watch } from 'vue';
import { api } from '../api.js';
import { photo } from '../assets.js';
import RestaurantCard from '../components/RestaurantCard.vue';
import RestaurantFilters from '../components/RestaurantFilters.vue';
import SiteIcon from '../components/SiteIcon.vue';
import { useRequest } from '../composables/useRequest.js';

const filters = ref({ query: '', cuisine: '', district: '', price: '' });
const restaurants = ref([]);
const { pending, failure, run } = useRequest();
const status = computed(() => {
  if (failure.value) return failure.value;
  if (pending.value) return 'Загружаем рестораны…';
  return restaurants.value.length ? 'Найдено: ' + restaurants.value.length : 'Ресторанов не найдено';
});

watch(filters, (value, previous, onCleanup) => {
  const update = () => run(() => api.list(value), data => { restaurants.value = data; });
  if (!previous) update();
  else {
    const timer = setTimeout(update, 180);
    onCleanup(() => clearTimeout(timer));
  }
}, { immediate: true, deep: true });
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <p class="location"><SiteIcon name="pin" /> Санкт-Петербург</p>
      <h1>Забронируйте<br>столик</h1>
      <p class="hero-description">Найдите ресторан для ужина вдвоём, встречи с друзьями или семейного обеда.</p>
      <a href="#filters" class="btn btn-primary">Найти ресторан</a>
    </div>
    <img class="hero-image" :src="photo('hero.jpg')" alt="Столики в ресторане с деревянным интерьером и тёплым светом" width="1500" height="1000">
  </section>
  <section class="search-section" aria-labelledby="catalog-title">
    <div class="section-heading"><h2 id="catalog-title">Рестораны города</h2><p class="muted" role="status">{{ status }}</p></div>
    <RestaurantFilters v-model="filters" />
    <div v-if="!failure" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" :aria-busy="pending">
      <div v-for="restaurant in restaurants" :key="restaurant.id" class="col"><RestaurantCard :restaurant="restaurant" /></div>
      <p v-if="!pending && !restaurants.length" class="panel empty-state">Попробуйте изменить запрос или сбросить фильтры.</p>
    </div>
  </section>
</template>
