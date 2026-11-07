<template>
  <loading-state v-if="loading" />
  <error-alert v-else-if="error" :error="error" />
  <p v-else-if="recipes.length === 0" class="empty-state">{{ emptyText }}</p>
  <div v-else class="row g-4">
    <div v-for="recipe in recipes" :key="recipe.id" class="col-12 col-sm-6 col-lg-4">
      <recipe-card :recipe="recipe" :author-name="nameOf(recipe.userId)">
        <template #actions>
          <slot name="actions" :recipe="recipe" />
        </template>
      </recipe-card>
    </div>
  </div>
</template>

<script setup>
import ErrorAlert from '@/components/ErrorAlert.vue'
import LoadingState from '@/components/LoadingState.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { useProfiles } from '@/composables/useProfiles'

defineProps({
  recipes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  emptyText: { type: String, default: 'Рецептов пока нет' },
})

const { nameOf } = useProfiles()
</script>
