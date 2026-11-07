<template>
  <base-layout>
    <h1 class="h2 mb-4">Поиск рецептов</h1>
    <div class="row g-4">
      <aside class="col-lg-3">
        <button
          class="btn btn-outline-primary w-100 d-lg-none mb-3"
          type="button"
          aria-controls="filtersPanel"
          :aria-expanded="String(filtersOpen)"
          @click="filtersOpen = !filtersOpen"
        >
          Фильтры
        </button>
        <div id="filtersPanel" class="d-lg-block" :class="{ 'd-none': !filtersOpen }">
          <recipe-filters v-model:filters="filters" @reset="reset" />
        </div>
      </aside>

      <section class="col-lg-9" aria-labelledby="resultsTitle">
        <h2 id="resultsTitle" class="visually-hidden">Результаты поиска</h2>
        <div
          class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3"
        >
          <p class="mb-0 text-muted" role="status" aria-live="polite">
            {{
              loading
                ? 'Загрузка...'
                : `Найдено: ${plural(results.length, ['рецепт', 'рецепта', 'рецептов'])}`
            }}
          </p>
          <div class="d-flex align-items-center gap-2">
            <label for="sort" class="text-nowrap">Сортировка</label>
            <select id="sort" v-model="filters.sort" class="form-select form-select-sm">
              <option value="popular">Популярные</option>
              <option value="fast">Быстрые</option>
              <option value="title">По алфавиту</option>
            </select>
          </div>
        </div>
        <recipe-grid
          :recipes="results"
          :loading="loading && results.length === 0"
          :error="error"
          empty-text="Ничего не нашлось. Попробуйте убрать часть фильтров."
        />
      </section>
    </div>
  </base-layout>
</template>

<script setup>
import { ref } from 'vue'

import RecipeFilters from '@/components/RecipeFilters.vue'
import RecipeGrid from '@/components/RecipeGrid.vue'
import { useRecipeFilters } from '@/composables/useRecipeFilters'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { plural } from '@/utils/format'

const filtersOpen = ref(false)
const { filters, results, loading, error, reset } = useRecipeFilters()
</script>
