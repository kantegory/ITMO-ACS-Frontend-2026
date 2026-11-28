<script setup>
import { onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AlertBanner from '@/components/common/AlertBanner.vue'
import PropertyFilters from '@/components/properties/PropertyFilters.vue'
import PropertyCard from '@/components/properties/PropertyCard.vue'
import { usePropertiesStore } from '@/stores/properties'
import { useAsyncState } from '@/composables/useAsyncState'

const propertiesStore = usePropertiesStore()
const { loading, error, run } = useAsyncState(true)

async function loadProperties(nextFilters) {
  try {
    await run(() => propertiesStore.fetchProperties(nextFilters))
  } catch {
    propertiesStore.items = []
  }
}

async function resetProperties() {
  try {
    await run(() => propertiesStore.resetFilters())
  } catch {
    propertiesStore.items = []
  }
}

onMounted(() => {
  loadProperties(propertiesStore.filters)
})
</script>

<template>
  <AppLayout>
    <h1 class="h2 mb-4">Поиск жилья</h1>

    <div class="row">
      <div class="col-lg-3 mb-4">
        <PropertyFilters
          :model-value="propertiesStore.filters"
          :disabled="loading"
          @apply="loadProperties"
          @reset="resetProperties"
        />
      </div>

      <section class="col-lg-9" aria-labelledby="resultsTitle" :aria-busy="loading">
        <h2 id="resultsTitle" class="visually-hidden">Результаты поиска</h2>
        <p class="text-muted" role="status">
          Найдено объявлений: <span>{{ propertiesStore.items.length }}</span>
        </p>

        <p v-if="loading" class="text-muted" role="status">Загрузка объявлений…</p>
        <AlertBanner :message="error" type="danger" />

        <ul v-if="propertiesStore.items.length" class="row g-4 list-unstyled">
          <li
            v-for="property in propertiesStore.items"
            :key="property.id"
            class="col-md-6 col-xl-4"
          >
            <PropertyCard :property="property" />
          </li>
        </ul>

        <p
          v-else-if="!loading && !error"
          class="alert alert-warning mt-4"
          role="status"
        >
          По вашему запросу ничего не найдено.
        </p>
      </section>
    </div>
  </AppLayout>
</template>
