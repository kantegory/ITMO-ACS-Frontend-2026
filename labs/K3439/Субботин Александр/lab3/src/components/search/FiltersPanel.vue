<script setup>
// Панель фильтров поиска. На больших экранах — колонка слева, на телефоне — выезжающая панель
// (offcanvas-lg Bootstrap). Значения фильтров — общий объект из useRestaurantFilters (v-model:filters)
const filters = defineModel('filters', { type: Object, required: true })

defineProps({
  cuisines: { type: Array, required: true },
  districts: { type: Array, required: true },
  features: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['reset'])

const prices = [
  { value: '1', label: '₽', text: 'до 1 000 ₽' },
  { value: '2', label: '₽₽', text: '1 000–2 500 ₽' },
  { value: '3', label: '₽₽₽', text: 'от 2 500 ₽' },
]

const ratings = [
  { value: 0, id: 'rating-any', label: 'Любой' },
  { value: 4, id: 'rating-4', label: '4.0 и выше' },
  { value: 4.5, id: 'rating-45', label: '4.5 и выше' },
]
</script>

<template>
  <div id="filtersPanel" class="offcanvas-lg offcanvas-start filters-panel" tabindex="-1" aria-labelledby="filtersTitle">
    <div class="offcanvas-header">
      <h2 id="filtersTitle" class="offcanvas-title h5">Фильтры</h2>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#filtersPanel" aria-label="Закрыть"></button>
    </div>
    <div class="offcanvas-body">
      <form class="filters-form w-100" @submit.prevent>
        <fieldset class="mb-4">
          <legend class="filter-title">Кухня</legend>
          <div :aria-busy="loading">
            <div v-for="cuisine in cuisines" :key="cuisine.id" class="form-check">
              <input :id="`cuisine-${cuisine.id}`" v-model="filters.cuisines" class="form-check-input" type="checkbox" :value="cuisine.id">
              <label class="form-check-label" :for="`cuisine-${cuisine.id}`">{{ cuisine.name }}</label>
            </div>
          </div>
        </fieldset>

        <div class="mb-4">
          <label class="filter-title form-label" for="filterDistrict">Район</label>
          <select id="filterDistrict" v-model="filters.district" class="form-select">
            <option value="">Все районы</option>
            <option v-for="district in districts" :key="district.id" :value="district.id">{{ district.name }}</option>
          </select>
        </div>

        <fieldset class="mb-4">
          <legend class="filter-title">Средний чек</legend>
          <div class="btn-group w-100">
            <template v-for="price in prices" :key="price.value">
              <input :id="`price-${price.value}`" v-model="filters.prices" class="btn-check" type="checkbox" :value="price.value" autocomplete="off">
              <label class="btn btn-outline-primary" :for="`price-${price.value}`"><span aria-hidden="true">{{ price.label }}</span><span class="visually-hidden">{{ price.text }}</span></label>
            </template>
          </div>
          <p class="form-text mb-0" aria-hidden="true">₽ — до 1&nbsp;000&nbsp;₽, ₽₽ — 1&nbsp;000–2&nbsp;500&nbsp;₽, ₽₽₽ — от 2&nbsp;500&nbsp;₽ на человека</p>
        </fieldset>

        <fieldset class="mb-4">
          <legend class="filter-title">Рейтинг</legend>
          <div v-for="rating in ratings" :key="rating.id" class="form-check">
            <input :id="rating.id" v-model="filters.rating" class="form-check-input" name="rating" type="radio" :value="rating.value">
            <label class="form-check-label" :for="rating.id">{{ rating.label }}</label>
          </div>
        </fieldset>

        <fieldset class="mb-4">
          <legend class="filter-title">Особенности</legend>
          <div :aria-busy="loading">
            <div v-for="feature in features" :key="feature.id" class="form-check form-switch">
              <input :id="`feature-${feature.id}`" v-model="filters.features" class="form-check-input" type="checkbox" role="switch" :value="feature.id">
              <label class="form-check-label" :for="`feature-${feature.id}`">{{ feature.name }}</label>
            </div>
          </div>
        </fieldset>

        <button class="btn btn-outline-secondary w-100" type="button" @click="emit('reset')">Сбросить фильтры</button>
        <button class="btn btn-primary w-100 mt-2 d-lg-none" type="button" data-bs-dismiss="offcanvas" data-bs-target="#filtersPanel">Показать результаты</button>
      </form>
    </div>
  </div>
</template>
