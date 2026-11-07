<script setup>
import { computed, onMounted, ref, watch } from "vue";
import api from "../api/client";
import { getLocalDate } from "../utils/date";
import { useAsync } from "../composables/useAsync";
import RestaurantCard from "../components/RestaurantCard.vue";
import SvgIcon from "../components/SvgIcon.vue";
const all = ref([]);
const restaurants = ref([]);
const cuisine = ref("");
const district = ref("");
const today = getLocalDate();
const date = ref(today);
const guests = ref(2);
const { loading, error, run } = useAsync();
function scrollToCatalog() {
  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
}
const cuisines = computed(() => [...new Set(all.value.map((r) => r.cuisine))]);
const districts = computed(() => [
  ...new Set(all.value.map((r) => r.district)),
]);
let revision = 0;
async function load() {
  const version = ++revision;
  const params = {};
  if (cuisine.value) params.cuisine = cuisine.value;
  if (district.value) params.district = district.value;
  const result = await run(() => api.get("/restaurants", { params }));
  if (version === revision && result) restaurants.value = result;
}
onMounted(async () => {
  const result = await run(() => api.get("/restaurants"));
  if (result) {
    all.value = result;
    restaurants.value = result;
  }
});
watch([cuisine, district], load);
</script>
<template>
  <header class="hero">
    <div class="container">
      <p class="eyebrow">Гастрономический гид по Петербургу</p>
      <h1>Столик в любимом<br />ресторане — за минуту.</h1>
      <p class="lead col-lg-6">
        Выбирайте место для важного вечера, встречайте друзей и бронируйте без
        звонков.
      </p>
      <form class="search-card row g-2" @submit.prevent="scrollToCatalog">
        <div class="col-md">
          <label for="district">Где</label>
          <select id="district" v-model="district" class="form-select">
            <option value="">Любой район</option>
            <option v-for="item in districts" :key="item">{{ item }}</option>
          </select>
        </div>
        <div class="col-md">
          <label for="search-date">Когда</label>
          <input
            id="search-date"
            v-model="date"
            class="form-control"
            type="date"
            :min="today"
          />
        </div>
        <div class="col-md">
          <label for="search-guests">Гостей</label>
          <select
            id="search-guests"
            v-model.number="guests"
            class="form-select"
          >
            <option v-for="count in 8" :key="count" :value="count">
              {{ count }}
            </option>
          </select>
        </div>
        <div class="col-md-auto d-grid">
          <button class="btn btn-accent px-4">Найти столик</button>
        </div>
      </form>
    </div>
  </header>
  <main id="main-content" tabindex="-1" class="container py-5">
    <div class="d-flex justify-content-between align-items-end mb-4">
      <div>
        <p class="eyebrow mb-1">Подборка недели</p>
        <h2>Рестораны, которые стоит открыть</h2>
      </div>
      <a class="link-dark" href="#catalog"
        >Все места <SvgIcon name="arrow-up-right"
      /></a>
    </div>
    <div class="filter-bar mb-4" role="group" aria-label="Фильтр по кухне">
      <button
        type="button"
        class="filter"
        :class="{ active: !cuisine }"
        :aria-pressed="!cuisine"
        @click="cuisine = ''"
      >
        Все
      </button>
      <button
        v-for="item in cuisines"
        :key="item"
        type="button"
        class="filter"
        :class="{ active: cuisine === item }"
        :aria-pressed="cuisine === item"
        @click="cuisine = item"
      >
        {{ item }}
      </button>
    </div>
    <p v-if="error" class="alert alert-danger" role="alert">
      {{ error }} <button class="btn btn-link" @click="load">Повторить</button>
    </p>
    <p class="visually-hidden" role="status">
      {{ loading ? "Загрузка" : `Найдено ресторанов: ${restaurants.length}` }}
    </p>
    <div id="catalog" class="row g-4">
      <p v-if="!loading && !error && !restaurants.length">
        Рестораны не найдены.
      </p>
      <RestaurantCard
        v-for="item in restaurants"
        :key="item.id"
        :restaurant="item"
        :date="date"
        :guests="guests"
      />
    </div>
  </main>
</template>
