<script setup>
/**
 * RecipeCard.vue — карточка рецепта в лентах и результатах поиска.
 */

import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import BaseIcon from './BaseIcon.vue';
import { useCatalogStore } from '@/stores/catalog';
import { assetUrl } from '@/utils/assets';
import { formatDuration } from '@/utils/format';

const props = defineProps({
  recipe: { type: Object, required: true },
});

const catalog = useCatalogStore();

const authorName = computed(() => catalog.userName(props.recipe.userId));
const liked = computed(() => catalog.isLiked(props.recipe.id));
const bookmarked = computed(() => catalog.isBookmarked(props.recipe.id));
const likesCount = computed(
  () => Number(props.recipe.likes || 0) + (liked.value ? 1 : 0),
);
</script>

<template>
  <article class="card h-100 shadow-sm">
    <img
      :src="assetUrl(recipe.image)"
      alt=""
      class="card-img-top rh-card-image"
      loading="lazy"
      decoding="async"
    >
    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
        <span class="badge rh-badge">{{ recipe.dishType }}</span>
        <span class="text-muted small">{{ recipe.difficulty }} сложность</span>
      </div>

      <h3 class="h6 card-title mb-1">
        <RouterLink
          :to="{ name: 'recipe', params: { id: recipe.id } }"
          class="rh-link-reset stretched-link"
        >
          {{ recipe.title }}
        </RouterLink>
      </h3>

      <p class="card-text text-muted small flex-grow-1">
        <span class="visually-hidden">Автор: </span>{{ authorName }}
      </p>

      <div
        class="d-flex justify-content-between align-items-center small text-muted"
      >
        <span class="d-inline-flex align-items-center gap-1">
          <BaseIcon name="clock" />
          <span class="visually-hidden">Время: </span>
          {{ formatDuration(recipe.timeMinutes) }}
        </span>
        <span class="d-inline-flex align-items-center gap-1">
          <BaseIcon name="heart" />
          <span class="visually-hidden">Лайков: </span>
          <span>{{ likesCount }}</span>
        </span>
        <span v-if="bookmarked" class="badge rh-badge-saved">
          Сохранён
        </span>
      </div>
    </div>
  </article>
</template>
