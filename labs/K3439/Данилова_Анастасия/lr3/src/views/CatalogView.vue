<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'
import { useRequest } from '../composables/useRequest'
import PropertyCard from '../components/PropertyCard.vue'
import ListingFilters from '../components/ListingFilters.vue'

const initialFilters = { type: '', city: '', min: '', max: '' }
const filters = ref({ ...initialFilters })
const properties = ref([])
const { pending, error, run } = useRequest()

function search() {
  return run(async () => {
    const params = {}
    if (filters.value.type) params.type = filters.value.type
    if (filters.value.city.trim()) params.city_like = filters.value.city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (filters.value.min !== '') params.pricePerMonth_gte = filters.value.min
    if (filters.value.max !== '') params.pricePerMonth_lte = filters.value.max
    const { data } = await api.get('/properties', { params })
    properties.value = data
  })
}

function reset() {
  filters.value = { ...initialFilters }
  search()
}

onMounted(search)
</script>

<template>
  <h1 class="h3 mb-4">Найдите жильё для аренды</h1>
  <div class="row g-4">
    <ListingFilters v-model="filters" :pending="pending" @search="search" @reset="reset" />
    <section class="col-lg-9" aria-label="Результаты поиска">
      <p v-if="error" role="alert" class="alert alert-danger">{{ error }}</p>
      <p v-else role="status">{{ pending ? 'Загружаем объявления…' : 'Найдено объектов: ' + properties.length }}</p>
      <p v-if="!pending && !error && !properties.length">По этим фильтрам объявления не найдены.</p>
      <div class="row g-3">
        <div v-for="property in properties" :key="property.id" class="col-md-6 col-xl-4">
          <PropertyCard :property="property" />
        </div>
      </div>
    </section>
  </div>
</template>
