<script setup>
/**
 * CommentsSection.vue — комментарии рецепта: загрузка, список и форма.
 */

import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import BaseIcon from '@/components/BaseIcon.vue';
import { useAuthStore } from '@/stores/auth';
import { useCatalogStore } from '@/stores/catalog';
import { announce } from '@/composables/useLiveRegion';
import { formatDate } from '@/utils/format';

const props = defineProps({
  recipeId: { type: [String, Number], required: true },
});

const auth = useAuthStore();
const catalog = useCatalogStore();

const loading = ref(true);
const error = ref(null);
const text = ref('');
const invalid = ref(false);
const submitting = ref(false);
const textarea = ref(null);

const comments = computed(() => catalog.commentsFor(props.recipeId));

async function load() {
  loading.value = true;
  error.value = null;

  try {
    await catalog.loadUsers();
  } catch {
    /* Имена авторов не критичны для загрузки комментариев. */
  }

  try {
    await catalog.loadComments(props.recipeId);
  } catch (err) {
    error.value = err;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => props.recipeId, load);

async function submit() {
  error.value = '';

  if (!auth.user) {
    error.value = 'Чтобы оставить комментарий, войдите в аккаунт.';
    return;
  }

  const value = text.value.trim();
  invalid.value = !value;

  if (!value) {
    await nextTick();
    textarea.value?.focus();
    return;
  }

  submitting.value = true;
  try {
    await catalog.addComment({
      recipeId: props.recipeId,
      userId: auth.user.id,
      text: value,
    });

    text.value = '';
    invalid.value = false;
    announce('Комментарий добавлен');
  } catch (err) {
    error.value = err;
  } finally {
    submitting.value = false;
  }
}

function messageOf(err) {
  return err?.message || 'Произошла ошибка. Попробуйте ещё раз.';
}
</script>

<template>
  <section class="card card-body shadow-sm" aria-labelledby="comments-heading">
    <h2 class="h5" id="comments-heading">
      <BaseIcon name="chat" class="me-2" />Комментарии
      ({{ comments.length }})
    </h2>

    <div v-if="loading" class="alert alert-light border" role="status">
      Загрузка комментариев…
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <p class="mb-2">{{ messageOf(error) }}</p>
      <button
        v-if="!auth.user || error.status !== 401"
        class="btn btn-sm btn-outline-secondary"
        type="button"
        @click="load"
      >
        Повторить
      </button>
    </div>

    <ul v-else class="list-unstyled mb-3">
      <li v-if="!comments.length" class="text-muted py-3">
        Комментариев пока нет.
      </li>
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="rh-comment py-3"
      >
        <div class="d-flex justify-content-between align-items-baseline gap-2">
          <strong>{{ catalog.userName(comment.userId) }}</strong>
          <time class="text-muted small" :datetime="comment.createdAt">
            {{ formatDate(comment.createdAt) }}
          </time>
        </div>
        <p class="mb-0">{{ comment.text }}</p>
      </li>
    </ul>

    <p v-if="!auth.user" class="small text-muted">
      <RouterLink
        :to="{ name: 'login', query: { redirect: $route.fullPath } }"
      >
        Войдите
      </RouterLink>
      или
      <RouterLink
        :to="{ name: 'register', query: { redirect: $route.fullPath } }"
      >
        зарегистрируйтесь
      </RouterLink>,
      чтобы оставить комментарий.
    </p>

    <form
      novalidate
      :aria-busy="submitting"
      @submit.prevent="submit"
    >
      <div class="mb-3">
        <label class="form-label" for="comment-text">
          Оставить комментарий
        </label>
        <textarea
          id="comment-text"
          ref="textarea"
          v-model="text"
          class="form-control"
          :class="{ 'is-invalid': invalid }"
          name="text"
          rows="3"
          maxlength="1000"
          aria-describedby="comment-text-error"
          :aria-invalid="invalid ? 'true' : 'false'"
          placeholder="Поделитесь впечатлением о рецепте"
          required
        ></textarea>
        <div class="invalid-feedback" id="comment-text-error">
          Введите текст комментария.
        </div>
      </div>

      <button
        class="btn btn-rh-primary"
        type="submit"
        :disabled="submitting || !auth.user"
      >
        {{ submitting ? 'Отправка…' : 'Отправить' }}
      </button>
    </form>
  </section>
</template>

