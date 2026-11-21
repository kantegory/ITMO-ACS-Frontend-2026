<script setup>
import { computed, ref } from 'vue'
import ListingCard from './components/ListingCard.vue'
import ListingFilters from './components/ListingFilters.vue'

const listings = [
  { id: 1, title: 'Однушка у метро', city: 'Санкт-Петербург', type: 'Квартира', price: 35000 },
  { id: 2, title: 'Студия с балконом', city: 'Санкт-Петербург', type: 'Студия', price: 27000 },
  { id: 3, title: 'Двухкомнатная у парка', city: 'Москва', type: 'Квартира', price: 59000 }
]
const cities = [...new Set(listings.map(listing => listing.city))]
const city = ref('')
const savedIds = ref([])
const shown = computed(() => city.value ? listings.filter(listing => listing.city === city.value) : listings)

function toggleSaved(id) {
  savedIds.value = savedIds.value.includes(id)
    ? savedIds.value.filter(saved => saved !== id)
    : [...savedIds.value, id]
}
</script>

<template>
  <header>
    <div class="wrap header">
      <strong>Snimu</strong>
      <span role="status">В избранном: {{ savedIds.length }}</span>
    </div>
  </header>
  <main class="wrap">
    <h1>Подбор жилья</h1>
    <ListingFilters v-model="city" :cities="cities" />
    <p class="count" role="status">Объявлений: {{ shown.length }}</p>
    <div class="listings">
      <ListingCard v-for="listing in shown" :key="listing.id" :listing="listing"
                   :saved="savedIds.includes(listing.id)" @toggle="toggleSaved" />
    </div>
  </main>
</template>
