<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from '../api'
import { TYPE_NAMES } from '../format'
import { useRequest } from '../composables/useRequest'
import PropertyCard from '../components/PropertyCard.vue'

const initialFilters = { type: '', city: '', min: '', max: '' }
const filters = reactive({ ...initialFilters })
const properties = ref([])
const { pending, error, run } = useRequest()

function search() {
  return run(async () => {
    const params = {}
    if (filters.type) params.type = filters.type
    if (filters.city.trim()) params.city_like = filters.city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (filters.min !== '') params.pricePerMonth_gte = filters.min
    if (filters.max !== '') params.pricePerMonth_lte = filters.max
    const { data } = await api.get('/properties', { params })
    properties.value = data
  })
}

function reset() {
  Object.assign(filters, initialFilters)
  search()
}

onMounted(search)
</script>

<template>
  <h1 class="h3 mb-4">Найдите жильё для аренды</h1>
  <div class="row g-4">
    <aside class="col-lg-3" aria-label="Фильтры">
      <form class="card card-body gap-2" @submit.prevent="search">
        <label for="type">Тип</label>
        <select id="type" v-model="filters.type" class="form-select">
          <option value="">Все</option>
          <option v-for="(title, type) in TYPE_NAMES" :key="type" :value="type">{{ title }}</option>
        </select>
        <label for="city">Город</label>
        <input id="city" v-model="filters.city" class="form-control">
        <fieldset>
          <legend class="fs-6">Цена, ₽/мес</legend>
          <label for="min">От</label>
          <input id="min" v-model.number="filters.min" type="number" min="0" class="form-control mb-2">
          <label for="max">До</label>
          <input id="max" v-model.number="filters.max" type="number" min="0" class="form-control">
        </fieldset>
        <button class="btn btn-primary" :disabled="pending">Найти</button>
        <button type="button" class="btn btn-outline-secondary" :disabled="pending" @click="reset">Сбросить</button>
      </form>
    </aside>
    <section class="col-lg-9" aria-label="Результаты поиска">
      <p v-if="error" role="alert" class="alert alert-danger">{{ error }}</p>
      <p v-else role="status">{{ pending ? 'Загружаем объявления…' : 'Найдено объектов: ' + properties.length }}</p>
      <div class="row g-3">
        <div v-for="property in properties" :key="property.id" class="col-md-6 col-xl-4">
          <PropertyCard :property="property" />
        </div>
      </div>
    </section>
  </div>
</template>
