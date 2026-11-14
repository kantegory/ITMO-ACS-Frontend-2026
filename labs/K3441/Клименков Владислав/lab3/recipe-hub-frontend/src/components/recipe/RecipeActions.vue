<script setup>
/**
 * RecipeActions.vue — лайк, закладка и «Поделиться» на странице рецепта.
 */

import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import BaseIcon from '@/components/BaseIcon.vue';
import { useAuthStore } from '@/stores/auth';
import { useCatalogStore } from '@/stores/catalog';
import { announce } from '@/composables/useLiveRegion';

const props = defineProps({
  recipe: { type: Object, required: true },
});

const emit = defineEmits(['share']);

const auth = useAuthStore();
const catalog = useCatalogStore();

const busy = ref(false);
const error = ref('');

const liked = computed(() => catalog.isLiked(props.recipe.id));
const bookmarked = computed(() => catalog.isBookmarked(props.recipe.id));
const likesCount = computed(
  () => Number(props.recipe.likes || 0) + (liked.value ? 1 : 0),
);

async function toggleLike() {
  error.value = '';

  if (!auth.user) {
    error.value = 'Чтобы поставить лайк, войдите в аккаунт.';
    return;
  }

  busy.value = true;
  try {
    const active = await catalog.toggleLike(props.recipe.id, auth.user.id);
    announce(active ? 'Лайк поставлен' : 'Лайк снят');
  } catch (err) {
    error.value = err?.message || 'Не удалось изменить лайк.';
  } finally {
    busy.value = false;
  }
}

async function toggleBookmark() {
  error.value = '';

  if (!auth.user) {
    error.value = 'Чтобы сохранить рецепт, войдите в аккаунт.';
    return;
  }

  busy.value = true;
  try {
    const active = await catalog.toggleBookmark(
      props.recipe.id,
      auth.user.id,
    );
    announce(
      active ? 'Рецепт сохранён' : 'Рецепт удалён из сохранённых',
    );
  } catch (err) {
    error.value = err?.message || 'Не удалось изменить закладку.';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div>
    <div
      v-if="error"
      class="alert alert-warning py-2 px-3 d-flex flex-wrap align-items-center gap-2"
      role="alert"
    >
      <span>{{ error }}</span>
      <RouterLink
        v-if="!auth.user"
        class="alert-link"
        :to="{ name: 'login', query: { redirect: $route.fullPath } }"
      >
        Войти
      </RouterLink>
    </div>

    <div class="d-flex flex-wrap gap-2 mb-4">
      <button
        class="btn btn-outline-secondary rh-action-btn"
        type="button"
        :class="{ 'is-active': liked }"
        :aria-pressed="liked"
        :disabled="busy"
        @click="toggleLike"
      >
        <BaseIcon name="heart" class="me-1" />
        <span>{{ liked ? 'Вам нравится' : 'Нравится' }}</span>
        (<span class="visually-hidden">Лайков: </span>
        <span>{{ likesCount }}</span>)
      </button>

      <button
        class="btn btn-outline-secondary rh-action-btn"
        type="button"
        :class="{ 'is-active': bookmarked }"
        :aria-pressed="bookmarked"
        :disabled="busy"
        @click="toggleBookmark"
      >
        <BaseIcon name="bookmark" class="me-1" />
        <span>{{ bookmarked ? 'Сохранён' : 'Сохранить' }}</span>
      </button>

      <button
        class="btn btn-outline-secondary"
        type="button"
        aria-haspopup="dialog"
        @click="emit('share')"
      >
        Поделиться
      </button>
    </div>
  </div>
</template>
