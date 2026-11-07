<script setup>
import RecipeCard from "./RecipeCard.vue";
defineProps({
  recipes: { type: Array, required: true },
  isFavorite: { type: Function, required: true },
});
defineEmits(["toggle-favorite"]);
</script>
<template>
  <div class="recipe-grid">
    <RecipeCard
      v-for="recipe in recipes"
      :key="recipe.id"
      :recipe="recipe"
      :favorite="isFavorite(recipe.id)"
      @toggle-favorite="$emit('toggle-favorite', $event)"
    />
  </div>
</template>
