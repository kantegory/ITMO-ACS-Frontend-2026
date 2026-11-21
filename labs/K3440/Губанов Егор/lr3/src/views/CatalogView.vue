<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api/index.js'
import { LEVELS, TYPES } from '../constants.js'
import { useRequest } from '../composables/useRequest.js'
import TrainingFilters from '../components/TrainingFilters.vue'
import TrainingCard from '../components/TrainingCard.vue'
import StatusMessage from '../components/StatusMessage.vue'

const route = useRoute()
const router = useRouter()
const durations = ['15', '20', '30']
const filters = ref(readFilters(route.query))
const hasFilters = computed(() => Object.values(filters.value).some(value => value.trim()))
const { data: trainings, loading, error, execute } = useRequest(
    signal => api.getTrainings(filters.value, signal),
    { keepData: true }
)
let timeout

function readFilters(query) {
  return {
    type: typeof query.type === 'string' && Object.hasOwn(TYPES, query.type) ? query.type : '',
    level: typeof query.level === 'string' && Object.hasOwn(LEVELS, query.level) ? query.level : '',
    maxMinutes: durations.includes(query.maxMinutes) ? query.maxMinutes : '',
    search: typeof query.q === 'string' ? query.q : ''
  }
}

function applyFilters() {
  clearTimeout(timeout)
  if (route.name !== 'catalog') return

  const { type, level, maxMinutes, search } = filters.value
  const query = {
    type: type || undefined,
    level: level || undefined,
    maxMinutes: maxMinutes || undefined,
    q: search.trim() ? search : undefined
  }
  const target = { name: 'catalog', query }

  if (router.resolve(target).fullPath === route.fullPath) {
    execute()
  } else {
    router.replace(target)
  }
}

function updateFilters(value) {
  filters.value = value
  clearTimeout(timeout)
  timeout = setTimeout(applyFilters, 250)
}

function resetFilters() {
  filters.value = readFilters({})
  applyFilters()
}

watch(() => route.query, query => {
  if (route.name !== 'catalog') return
  clearTimeout(timeout)
  filters.value = readFilters(query)
  execute()
}, { immediate: true })

onScopeDispose(() => clearTimeout(timeout))
</script>

<template>
  <h1 class="display-title catalog-title">Найти занятие</h1>
  <TrainingFilters :model-value="filters" @update:model-value="updateFilters" @submit="applyFilters" />

  <StatusMessage :message="error || (loading ? 'Загружаем занятия…' : '')" :error="Boolean(error)" />
  <button v-if="error" class="btn btn-brutal btn-paper mb-4" type="button" @click="applyFilters">
    Повторить
  </button>

  <div v-if="!error && trainings" class="d-flex align-items-center flex-wrap gap-2 mb-3">
    <p class="eyebrow mb-0" aria-live="polite">Найдено занятий: {{ trainings.length }}</p>
    <button v-if="hasFilters" class="btn btn-brutal btn-paper" type="button" @click="resetFilters">
      Сбросить фильтры
    </button>
  </div>

  <StatusMessage v-if="!error && !loading && trainings && !trainings.length" message="Таких занятий пока нет." />

  <section v-if="!error" class="row g-4" aria-label="Список занятий" :aria-busy="loading">
    <div v-for="training in trainings || []" :key="training.id" class="col-12 col-md-6 col-xl-4">
      <TrainingCard :training="training" :catalog-query="route.query" />
    </div>
  </section>
</template>