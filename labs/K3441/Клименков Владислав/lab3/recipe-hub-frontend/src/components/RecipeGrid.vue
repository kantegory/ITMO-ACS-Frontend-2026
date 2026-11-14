<script setup>
/**
 * RecipeGrid.vue — сетка рецептов с состояниями загрузки, пустоты и ошибки.
 */

import RecipeCard from './RecipeCard.vue';

defineProps({
  recipes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: [Object, String], default: null },
  emptyText: {
    type: String,
    default: 'Рецепты не найдены. Попробуйте изменить условия поиска.',
  },
  loadingText: { type: String, default: 'Загрузка рецептов…' },
  rowClass: {
    type: String,
    default: 'row-cols-1 row-cols-md-2 g-4',
  },
});

function messageOf(error) {
  if (!error) return '';
  return typeof error === 'string'
    ? error
    : error.message || 'Произошла ошибка. Попробуйте ещё раз.';
}
</script>

<template>
  <div :aria-busy="loading" :class="{ 'opacity-75': loading }">
    <div
      v-if="loading"
      class="alert alert-light border text-center mb-0"
      role="status"
    >
      {{ loadingText }}
    </div>

    <div v-else-if="error" class="alert alert-danger mb-0" role="alert">
      {{ messageOf(error) }}
    </div>

    <div
      v-else-if="!recipes.length"
      class="alert alert-light border text-center mb-0"
      role="status"
    >
      {{ emptyText }}
    </div>

    <div v-else class="row" :class="rowClass">
      <div v-for="recipe in recipes" :key="recipe.id" class="col">
        <RecipeCard :recipe="recipe" />
      </div>
    </div>
  </div>
</template>
