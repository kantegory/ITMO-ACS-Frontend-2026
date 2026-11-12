<script setup>
import { ref, computed, onMounted } from 'vue';
import RestaurantCard from '../components/RestaurantCard.vue';
import SearchFilters from '../components/SearchFilters.vue';
import { useApi } from '../composables/useApi';
const { api, message } = useApi();
const restaurants = ref([]);
const error = ref('');
const loading = ref(true);
const filters = ref({ query: '', cuisine: '', district: '', price: 0 });
const found = computed(() => restaurants.value.filter(r => {
  const f = filters.value;
  const term = f.query.trim().toLocaleLowerCase('ru');
  return (!term || `${r.name} ${r.description}`.toLocaleLowerCase('ru').includes(term))
    && (!f.cuisine || r.cuisine === f.cuisine)
    && (!f.district || r.district === f.district)
    && (!f.price || r.price <= f.price);
}));
onMounted(async () => { try { restaurants.value = (await api.get('/restaurants')).data; } catch (e) { error.value = message(e); } finally { loading.value = false; } });
</script>
<template>
  <section class="hero mb-5">
    <div class="hero-copy">
      <p class="hero-location">Санкт-Петербург</p>
      <h1>Вечер начинается с места.</h1>
      <p class="lead">Шесть ресторанов для встреч, которые хочется продлить. Выберите своё место и забронируйте столик.</p>
      <a class="btn btn-primary btn-lg" href="#search">Выбрать ресторан</a>
    </div>
    <div class="hero-visual" aria-hidden="true">
      <img class="hero-image" src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&amp;fit=crop&amp;w=900&amp;q=85" alt="">
      <span class="hero-caption">Встретимся за столом</span>
    </div>
  </section>
  <section id="search" aria-labelledby="search-title">
    <div class="section-heading"><h2 id="search-title" class="section-title">Куда сегодня?</h2><p class="result-count" aria-live="polite">Найдено ресторанов: {{ found.length }}</p></div>
    <SearchFilters v-model="filters" />
    <p v-if="loading" role="status">Загрузка ресторанов…</p>
    <p v-else-if="error" class="alert alert-danger" role="alert">Не удалось загрузить рестораны: {{ error }}. Запустите API-сервер.</p>
    <p v-else-if="!found.length" class="empty">Ничего не найдено. Попробуйте изменить фильтры.</p>
    <div v-else class="row g-4"><div v-for="restaurant in found" :key="restaurant.id" class="col-md-6 col-xl-4"><RestaurantCard :restaurant="restaurant" /></div></div>
  </section>
</template>
