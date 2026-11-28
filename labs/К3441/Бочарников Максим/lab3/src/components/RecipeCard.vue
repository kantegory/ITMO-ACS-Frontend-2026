<template>
  <article class="recipe-card">
    <RouterLink class="recipe-card__media" :to="`/recipe/${recipe.id}`">
      <img
        :src="recipe.image"
        :alt="recipe.title"
        loading="lazy"
        width="400"
        height="300"
      >
      <span class="recipe-card__badge">{{ recipe.type }}</span>
    </RouterLink>
    <div class="recipe-card__body">
      <h3 class="recipe-card__title">
        <RouterLink :to="`/recipe/${recipe.id}`">{{ recipe.title }}</RouterLink>
      </h3>
      <div class="recipe-card__meta">
        <span>{{ recipe.difficulty }}</span>
        <span>{{ recipe.time }}</span>
      </div>
      <div v-if="tags.length" class="recipe-card__tags">
        <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="recipe-card__footer">
        <div class="author-mini">
          <img :src="author.avatar" :alt="`Автор: ${author.name}`">
          <span>{{ author.name }}</span>
        </div>
        <LikeButton
          v-if="showLike"
          :recipe-id="recipe.id"
          :title="recipe.title"
          :likes="likes"
          :liked="liked"
          @update="onLikeUpdate"
        />
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import LikeButton from '@/components/LikeButton.vue'

const props = defineProps({
  recipe: { type: Object, required: true },
  author: { type: Object, default: () => ({ name: 'Автор', avatar: '' }) },
  liked: { type: Boolean, default: false },
  showLike: { type: Boolean, default: true },
})

const emit = defineEmits(['like-update'])

const likes = ref(Number(props.recipe.likes || 0))
const liked = ref(props.liked)

watch(
  () => props.liked,
  (v) => {
    liked.value = v
  }
)
watch(
  () => props.recipe.likes,
  (v) => {
    likes.value = Number(v || 0)
  }
)

const tags = computed(() => (props.recipe.ingredients || []).slice(0, 3))

function onLikeUpdate(next) {
  liked.value = next.liked
  likes.value = next.likes
  emit('like-update', { recipeId: props.recipe.id, ...next })
}
</script>
