<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import BaseIcon from '@/components/BaseIcon.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import RecipeFilters from '@/components/RecipeFilters.vue'
import RecipeGrid from '@/components/RecipeGrid.vue'
import { useRecipeSearch } from '@/composables/useRecipeSearch'
import { useSaved } from '@/composables/useSaved'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { countLabel } from '@/utils/format'

const route = useRoute()

// фильтры можно передать ссылкой: /?type=Супы или /?q=блины
const { filters, recipes, loading, error, search, reset } = useRecipeSearch({
  type: [].concat(route.query.type ?? []),
  q: route.query.q ?? ''
})
const { saved, loadSaved, toggleSave } = useSaved()

const CHIPS = [
  { label: 'Блины', query: 'блины' },
  { label: 'Супы', query: 'суп' },
  { label: 'С яйцами', query: 'яйца' },
  { label: 'Паста', query: 'паста' }
]

const status = computed(() =>
  loading.value ? '' : `Найдено ${countLabel(recipes.value.length, 'рецепт', 'рецепта', 'рецептов')}`
)

onMounted(async () => {
  await loadSaved()
  search()
})
</script>

<template>
  <BaseLayout>
    <section class="hero">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-7">
            <p class="hero__eyebrow">Сообщество домашних поваров</p>
            <h1 class="hero__title">Что приготовим сегодня?</h1>
            <p class="hero__text my-3">Рецепты от людей, которые готовят каждый день: с фотографиями, пошаговыми инструкциями и видео.</p>
            <form class="hero-search" role="search" @submit.prevent="search">
              <label class="visually-hidden" for="searchInput">Поиск рецептов по названию и ингредиентам</label>
              <input id="searchInput" v-model="filters.q" class="form-control" type="search" placeholder="Блины, борщ или «яйца»">
              <button class="btn btn-accent px-4" type="submit"><BaseIcon name="search" /> Найти</button>
            </form>
            <div class="hero__chips" role="group" aria-label="Популярные запросы">
              <button v-for="chip in CHIPS" :key="chip.query" class="chip" type="button" @click="filters.q = chip.query">
                {{ chip.label }}
              </button>
            </div>
          </div>
          <div class="col-lg-5 d-none d-lg-block">
            <div class="hero__photos" aria-hidden="true">
              <img src="/img/recipes/shakshuka.jpg" alt="">
              <img src="/img/recipes/blini.jpg" alt="">
              <img src="/img/recipes/pumpkin-soup.jpg" alt="">
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container py-4">
      <div class="row g-4">
        <div class="col-lg-3">
          <div id="filtersPanel" class="offcanvas-lg offcanvas-start" tabindex="-1" aria-labelledby="filtersTitle">
            <div class="offcanvas-header">
              <h2 id="filtersTitle" class="offcanvas-title h5">Фильтры</h2>
              <button class="btn-close" type="button" data-bs-dismiss="offcanvas" data-bs-target="#filtersPanel" aria-label="Закрыть" />
            </div>
            <div class="offcanvas-body">
              <RecipeFilters v-model="filters" @reset="reset" />
            </div>
          </div>
        </div>

        <div class="col-lg-9">
          <div class="results-toolbar">
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-soft d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#filtersPanel" aria-controls="filtersPanel">
                <BaseIcon name="filter" /> Фильтры
              </button>
              <h2 class="h4 mb-0">Найдено: {{ loading ? '…' : recipes.length }}</h2>
            </div>
            <label class="visually-hidden" for="sortSelect">Сортировка</label>
            <select id="sortSelect" v-model="filters.sort" class="form-select">
              <option value="likes">Сначала популярные</option>
              <option value="date">Сначала новые</option>
              <option value="time">Быстрые в начале</option>
            </select>
          </div>

          <!-- итог поиска зачитывается скринридером без переноса фокуса -->
          <p class="visually-hidden" role="status" aria-live="polite">{{ status }}</p>

          <div :aria-busy="loading">
            <LoadingSpinner v-if="loading" />
            <div v-else-if="error" class="alert alert-warning" role="alert">
              Не удалось загрузить рецепты. Проверьте, что запущен API: <code>npm run api</code>.
            </div>
            <EmptyState v-else-if="!recipes.length">
              <p class="h5">Ничего не нашлось</p>
              <p class="mb-0">Попробуйте убрать часть фильтров или изменить запрос.</p>
            </EmptyState>
            <RecipeGrid v-else :recipes="recipes" :saved-ids="saved" @toggle-save="toggleSave" />
          </div>
        </div>
      </div>
    </section>
  </BaseLayout>
</template>
