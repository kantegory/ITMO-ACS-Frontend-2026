<script setup>
import { computed, onMounted, ref } from "vue";
import FilterSidebar from "../components/FilterSidebar.vue";
import RestaurantCard from "../components/RestaurantCard.vue";
import { useAsync } from "../composables/useAsync";
import { fetchRestaurants } from "../api/restaurants";

const { data: restaurants, error, run } = useAsync(fetchRestaurants);
const allRestaurants = ref([]);

const cuisines = computed(() => [...new Set(allRestaurants.value.map((r) => r.cuisine))].sort());
const cities = computed(() => [...new Set(allRestaurants.value.map((r) => r.city))].sort());

async function applyFilters(filters = {}) {
  await run(filters).catch(() => {});
}

onMounted(async () => {
  allRestaurants.value = await fetchRestaurants().catch(() => []);
  await applyFilters();
});
</script>

<template>
  <section class="hero text-center">
    <div class="container">
      <h1 class="fw-bold display-4">Найдите столик мечты</h1>
      <p class="lead">Бронирование столиков в лучших ресторанах вашего города за пару кликов</p>
    </div>
  </section>

  <main class="container my-5">
    <div class="row g-4">
      <div class="col-lg-3">
        <FilterSidebar :cuisines="cuisines" :cities="cities" @apply="applyFilters" />
      </div>

      <div class="col-lg-9">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="text-muted">
            <template v-if="restaurants">Найдено ресторанов: {{ restaurants.length }}</template>
          </span>
        </div>
        <div class="row g-4">
          <RestaurantCard v-for="r in restaurants" :key="r.id" :restaurant="r" />
        </div>
        <div v-if="error" class="alert alert-warning">
          Не удалось загрузить рестораны. Проверьте, что запущен мок-сервер API.
        </div>
        <div v-else-if="restaurants && restaurants.length === 0" class="alert alert-warning">
          По вашему запросу ничего не найдено.
        </div>
      </div>
    </div>
  </main>
</template>
