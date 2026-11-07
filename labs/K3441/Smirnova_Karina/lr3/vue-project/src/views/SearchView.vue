<script setup>
import { onMounted, reactive, ref } from 'vue'
import SearchFilters from '@/components/search/SearchFilters.vue'
import ListingCard from '@/components/search/ListingCard.vue'
import { getListings } from '@/api/listingsApi'
import { useToast } from '@/composables/useToast'

const initial = () => ({ mode: 'DAILY', location: 'Санкт-Петербург', type: '', min: '', max: '' })
const filters = reactive(initial())
const sort = ref('recommended')
const listings = ref([])
const loading = ref(false)
const { showToast } = useToast()

async function loadListings() {
  loading.value = true
  try {
    listings.value = await getListings({ ...filters, sort: sort.value })
  } catch {
    listings.value = []
    showToast('Ошибка загрузки объявлений')
  } finally {
    loading.value = false
  }
}
function updateFilters(next) {
  Object.assign(filters, next)
}
function reset() {
  Object.assign(filters, initial())
  sort.value = 'recommended'
  loadListings()
}
onMounted(loadListings)
</script>

<template>
  <main id="main-content" class="rs-main">
    <div class="rs-container">
      <h1 class="rs-page-title">Найдите подходящее жильё</h1>
      <p class="rs-page-subtitle">Выберите способ аренды, расположение и подходящую стоимость</p>
      <SearchFilters
        :model-value="filters"
        @update:model-value="updateFilters"
        @search="loadListings"
        @reset="reset"
      />
      <div class="results-toolbar">
        <h2 class="h5 m-0" role="status">
          {{ loading ? 'Загрузка объектов…' : `Найдено объектов: ${listings.length}` }}
        </h2>
        <select
          v-model="sort"
          class="form-select sort-select"
          aria-label="Порядок отображения"
          @change="loadListings"
        >
          <option value="recommended">Сначала рекомендуемые</option>
          <option value="price-asc">Сначала дешевле</option>
          <option value="price-desc">Сначала дороже</option>
        </select>
      </div>
      <div v-if="listings.length" class="listing-grid">
        <ListingCard v-for="listing in listings" :key="listing.id" :listing="listing" />
      </div>
      <section v-else-if="!loading" class="rs-card empty-state">
        <h2 class="h4">По заданным параметрам ничего не найдено</h2>
        <p class="rs-muted">Измените параметры поиска или сбросьте фильтры.</p>
        <button class="btn btn-primary" @click="reset">Сбросить фильтры</button>
      </section>
    </div>
  </main>
</template>

<style scoped>
.results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 28px 0 18px;
}
.sort-select {
  width: 250px;
}
.listing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}
.empty-state {
  padding: 50px;
  text-align: center;
}
@media (max-width: 992px) {
  .listing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 650px) {
  .listing-grid {
    grid-template-columns: 1fr;
  }
  .results-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .sort-select {
    width: 100%;
  }
}
</style>
