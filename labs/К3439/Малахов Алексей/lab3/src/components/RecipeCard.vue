<template>
  <article class="recipe-card card">
    <img
      :src="recipe.image"
      class="recipe-card__img"
      :alt="recipe.title"
      loading="lazy"
    />
    <div class="card-body d-flex flex-column gap-2">
      <div class="d-flex flex-wrap gap-2">
        <span class="badge badge-type">{{ recipe.type }}</span>
        <span class="badge badge-difficulty">{{ recipe.difficulty }}</span>
      </div>
      <h3 class="recipe-card__title mb-0">
        <router-link :to="{ name: 'recipe', params: { id: recipe.id } }">{{
          recipe.title
        }}</router-link>
      </h3>
      <p class="text-muted small mb-0">{{ authorName }}</p>
      <div class="meta">
        <span><app-icon name="clock" /> {{ recipe.time }} мин</span>
        <span><app-icon name="servings" /> {{ recipe.servings }} порц.</span>
      </div>
      <div class="card-actions d-flex gap-2 mt-auto pt-2">
        <like-button class="btn-sm" :recipe="recipe" />
        <save-button class="btn-sm" :recipe-id="recipe.id" />
        <slot name="actions" />
      </div>
    </div>
  </article>
</template>

<script setup>
import AppIcon from '@/components/AppIcon.vue'
import LikeButton from '@/components/LikeButton.vue'
import SaveButton from '@/components/SaveButton.vue'

defineProps({
  recipe: { type: Object, required: true },
  authorName: { type: String, default: '' },
})
</script>
