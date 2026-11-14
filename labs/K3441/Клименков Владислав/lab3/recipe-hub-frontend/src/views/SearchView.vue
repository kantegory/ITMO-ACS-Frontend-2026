<script setup>
/**
 * SearchView.vue — поиск рецептов с фильтрацией и сортировкой.
 */

import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseIcon from '@/components/BaseIcon.vue';
import RecipeGrid from '@/components/RecipeGrid.vue';
import { useRecipeSearch } from '@/composables/useRecipeSearch';

const route = useRoute();
const initialQuery =
  typeof route.query.query === 'string' ? route.query.query : '';

const {
  filters,
  recipes,
  loading,
  error,
  counterText,
  applyNow,
  resetFilters,
  dishTypes,
  difficulties,
} = useRecipeSearch({ query: initialQuery });

const timeOptions = [
  { value: '15', label: '15 минут' },
  { value: '30', label: '30 минут' },
  { value: '60', label: '1 час' },
  { value: '120', label: '2 часа' },
];

const sortOptions = [
  { value: 'new', label: 'Сначала новые' },
  { value: 'likes', label: 'По популярности' },
  { value: 'time-asc', label: 'По времени (возрастание)' },
  { value: 'time-desc', label: 'По времени (убывание)' },
];

onMounted(applyNow);
</script>

<template>
  <main id="main-content" class="rh-page py-4 py-lg-5" tabindex="-1">
    <div class="container">
      <h1 class="h3 mb-1">Поиск рецептов</h1>
      <p class="text-muted">
        Отфильтруйте рецепты по типу блюда, сложности, времени и ингредиентам.
      </p>

      <div class="row g-4">
        <!-- Панель фильтров -->
        <div class="col-12 col-lg-3">
          <form
            class="card card-body shadow-sm sticky-lg-top"
            style="top: 1rem"
            role="search"
            aria-labelledby="filters-heading"
            @submit.prevent="applyNow"
          >
            <h2 class="h6 mb-3" id="filters-heading">
              <BaseIcon name="filter" class="me-1" />Фильтры
            </h2>

            <div class="mb-3">
              <label class="form-label" for="filter-query">
                Название или описание
              </label>
              <input
                id="filter-query"
                v-model="filters.query"
                class="form-control"
                type="search"
                name="query"
                placeholder="Например, суп"
              >
            </div>

            <div class="mb-3">
              <label class="form-label" for="filter-dish">Тип блюда</label>
              <select
                id="filter-dish"
                v-model="filters.dishType"
                class="form-select"
                name="dishType"
              >
                <option value="">Любой</option>
                <option
                  v-for="type in dishTypes"
                  :key="type"
                  :value="type"
                >
                  {{ type }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label" for="filter-difficulty">
                Сложность
              </label>
              <select
                id="filter-difficulty"
                v-model="filters.difficulty"
                class="form-select"
                name="difficulty"
              >
                <option value="">Любая</option>
                <option
                  v-for="level in difficulties"
                  :key="level"
                  :value="level"
                >
                  {{ level }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label" for="filter-ingredient">
                Ингредиент
              </label>
              <input
                id="filter-ingredient"
                v-model="filters.ingredient"
                class="form-control"
                type="text"
                name="ingredient"
                placeholder="Например, авокадо"
              >
            </div>

            <div class="mb-3">
              <label class="form-label" for="filter-time">
                Время, не более
              </label>
              <select
                id="filter-time"
                v-model="filters.maxTime"
                class="form-select"
                name="maxTime"
              >
                <option value="">Не ограничено</option>
                <option
                  v-for="option in timeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="d-grid gap-2">
              <button class="btn btn-rh-primary" type="submit">
                <BaseIcon name="search" class="me-1" />Применить
              </button>
              <button
                class="btn btn-outline-secondary"
                type="button"
                @click="resetFilters"
              >
                Сбросить
              </button>
            </div>
          </form>
        </div>


        <!-- Результаты -->
        <div
          class="col-12 col-lg-9"
          role="region"
          aria-label="Результаты поиска"
        >
          <h2 class="visually-hidden">Результаты поиска</h2>

          <div
            class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"
          >
            <p
              class="text-muted mb-0"
              aria-live="polite"
              aria-atomic="true"
            >
              {{ counterText }}
            </p>
            <div class="d-flex align-items-center gap-2">
              <label
                class="form-label mb-0 small text-muted"
                for="filter-sort"
              >
                Сортировка
              </label>
              <select
                id="filter-sort"
                v-model="filters.sort"
                class="form-select form-select-sm w-auto"
                name="sort"
              >
                <option
                  v-for="option in sortOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <RecipeGrid
            :recipes="recipes"
            :loading="loading"
            :error="error"
            row-class="row-cols-1 row-cols-md-2 row-cols-xl-3 g-4"
          />
        </div>
      </div>
    </div>
  </main>
</template>

