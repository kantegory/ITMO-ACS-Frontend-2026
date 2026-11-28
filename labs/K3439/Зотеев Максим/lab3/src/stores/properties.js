import { ref } from 'vue'
import { defineStore } from 'pinia'
import { propertiesApi } from '@/api'

export function createEmptyFilters() {
  return {
    type: '',
    city: '',
    priceMin: '',
    priceMax: '',
  }
}

export const usePropertiesStore = defineStore('properties', () => {
  const items = ref([])
  const filters = ref(createEmptyFilters())

  async function fetchProperties(nextFilters = filters.value) {
    filters.value = { ...nextFilters }
    const data = await propertiesApi.getAll(filters.value)
    items.value = data
    return data
  }

  function resetFilters() {
    filters.value = createEmptyFilters()
    return fetchProperties(filters.value)
  }

  async function createProperty(payload) {
    const created = await propertiesApi.create(payload)
    items.value = [...items.value, created]
    return created
  }

  return {
    items,
    filters,
    fetchProperties,
    resetFilters,
    createProperty,
  }
})
