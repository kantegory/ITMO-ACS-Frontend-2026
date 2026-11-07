<script setup>
defineProps({ recipe: { type: Object, required: true }, favorite: Boolean });
defineEmits(["toggle-favorite"]);
</script>
<template>
  <article class="paper-card recipe-card">
    <div :class="['recipe-visual', recipe.visual]">
      <span class="food-emoji">{{ recipe.emoji }}</span
      ><span class="time-pill">◷ {{ recipe.time }} мин</span>
    </div>
    <div class="card-body">
      <div class="card-meta">
        <span class="tag-pill">{{ recipe.difficultyLabel }}</span
        ><span class="rating"
          >★ {{ String(recipe.rating).replace(".", ",") }}</span
        >
      </div>
      <h2>{{ recipe.shortTitle || recipe.title }}</h2>
      <p class="muted">{{ recipe.description }}</p>
      <div class="card-actions">
        <RouterLink class="button dark" :to="`/recipes/${recipe.id}`"
          >Открыть</RouterLink
        ><button
          :class="['icon-button', { active: favorite }]"
          type="button"
          :aria-label="
            favorite ? 'Удалить из избранного' : 'Добавить в избранное'
          "
          @click="$emit('toggle-favorite', recipe.id)"
        >
          {{ favorite ? "♥" : "♡" }}
        </button>
      </div>
    </div>
  </article>
</template>
