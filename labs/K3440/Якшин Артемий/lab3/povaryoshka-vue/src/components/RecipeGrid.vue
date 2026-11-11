<script setup>
import RecipeCard from '@/components/RecipeCard.vue'

// Сетка карточек: одна и та же на главной, у кулинара и в кабинете
defineProps({
  recipes: { type: Array, required: true },
  savedIds: { type: Map, default: () => new Map() },
  editable: { type: Boolean, default: false }
})

defineEmits(['toggle-save', 'edit', 'delete'])
</script>

<template>
  <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">
    <div v-for="recipe in recipes" :key="recipe.id" class="col">
      <RecipeCard
        :recipe="recipe"
        :saved="savedIds.has(recipe.id)"
        :editable="editable"
        @toggle-save="$emit('toggle-save', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
    <slot name="after" />
  </div>
</template>
