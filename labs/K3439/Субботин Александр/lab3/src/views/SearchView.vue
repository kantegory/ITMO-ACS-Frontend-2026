<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'

import { dictionariesApi, restaurantsApi } from '@/api'
import RestaurantCard from '@/components/restaurant/RestaurantCard.vue'
import FiltersPanel from '@/components/search/FiltersPanel.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BreadcrumbsNav from '@/components/ui/BreadcrumbsNav.vue'
import ErrorAlert from '@/components/ui/ErrorAlert.vue'
import LoaderBlock from '@/components/ui/LoaderBlock.vue'
import { useRequest } from '@/composables/useRequest'
import { applyClientFilters, serverParams, useRestaurantFilters } from '@/composables/useRestaurantFilters'
import { assetUrl } from '@/utils/format'

const route = useRoute()
const { filters, applied, activeCount, resetFilters } = useRestaurantFilters()

// Справочники для фильтров тоже приходят из API
const dictionaries = reactive(useRequest(async () => {
  const [cuisines, districts, features] = await Promise.all([
    dictionariesApi.getCuisines(),
    dictionariesApi.getDistricts(),
    dictionariesApi.getFeatures(),
  ])
  return { cuisines, districts, features }
}, { initialData: { cuisines: [], districts: [], features: [] } }))

// Запрос к json-server строится по фильтрам из адресной строки: поменялся адрес — грузим заново.
// useRequest рисует только ответ последнего запроса, даже если предыдущий пришёл позже
const restaurants = reactive(useRequest(() => restaurantsApi.getAll(serverParams(applied.value)), {
  initialData: [],
  immediate: false,
}))
watch(() => route.name === 'search' && route.fullPath, (path) => {
  if (path) restaurants.run()
}, { immediate: true })

const visible = computed(() => applyClientFilters(restaurants.data, applied.value))
const isFirstLoad = computed(() => restaurants.loading && !restaurants.data.length)
</script>

<template>
  <div class="container py-4">
    <BreadcrumbsNav :items="[{ label: 'Рестораны' }]" />

    <div class="mb-4">
      <h1 class="mb-1">Рестораны Петербурга</h1>
      <p class="text-muted-warm mb-0" role="status">Найдено: <strong>{{ isFirstLoad ? '…' : visible.length }}</strong></p>
    </div>

    <div class="row g-4">
      <div class="col-lg-3">
        <FiltersPanel
          v-model:filters="filters"
          :cuisines="dictionaries.data.cuisines"
          :districts="dictionaries.data.districts"
          :features="dictionaries.data.features"
          :loading="dictionaries.loading"
          @reset="resetFilters"
        />
      </div>

      <div class="col-lg-9">
        <div class="search-toolbar d-flex flex-wrap gap-2 mb-4">
          <div class="search-field flex-grow-1">
            <label class="visually-hidden" for="searchQuery">Поиск по названию, блюду или адресу</label>
            <AppIcon name="search" />
            <input id="searchQuery" v-model="filters.q" class="form-control" type="search" placeholder="Ресторан, блюдо или адрес">
          </div>
          <div class="d-flex gap-2">
            <label class="visually-hidden" for="sortSelect">Сортировка</label>
            <select id="sortSelect" v-model="filters.sort" class="form-select">
              <option value="rating">По рейтингу</option>
              <option value="reviews">По числу отзывов</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
            </select>
            <button class="btn btn-outline-primary d-lg-none text-nowrap" type="button" data-bs-toggle="offcanvas" data-bs-target="#filtersPanel" aria-controls="filtersPanel">
              <AppIcon name="filter" />
              Фильтры <span v-if="activeCount" class="badge text-bg-primary"><span class="visually-hidden">, выбрано: </span>{{ activeCount }}</span>
            </button>
          </div>
        </div>

        <LoaderBlock v-if="isFirstLoad" text="Ищем рестораны…" />
        <ErrorAlert v-else-if="restaurants.error" :message="restaurants.error.message" />
        <template v-else>
          <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4" :aria-busy="restaurants.loading">
            <div v-for="restaurant in visible" :key="restaurant.id" class="col">
              <RestaurantCard :restaurant="restaurant" />
            </div>
          </div>

          <div v-if="!visible.length && !restaurants.loading" class="empty-state text-center py-5">
            <img :src="assetUrl('img/hero.svg')" alt="" width="160" height="140">
            <h2 class="h4 mt-3">Ничего не нашлось</h2>
            <p class="text-muted-warm">Попробуйте убрать часть фильтров или изменить запрос.</p>
            <button class="btn btn-primary" type="button" @click="resetFilters">Сбросить фильтры</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
