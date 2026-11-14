<script setup>
/**
 * RecipeView.vue — страница одного рецепта.
 *
 * Рецепт выбирается по маршруту /recipe/:id. Данные загружаются из API,
 * автор подтягивается из справочника, комментарии — в CommentsSection.
 */

import { computed, nextTick, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import BaseIcon from '@/components/BaseIcon.vue';
import AuthorCard from '@/components/AuthorCard.vue';
import RecipeActions from '@/components/recipe/RecipeActions.vue';
import CommentsSection from '@/components/recipe/CommentsSection.vue';
import ShareModal from '@/components/recipe/ShareModal.vue';
import { recipes as recipesApi } from '@/api/resources';
import { useCatalogStore } from '@/stores/catalog';
import { assetUrl } from '@/utils/assets';
import { formatDuration } from '@/utils/format';

const route = useRoute();
const catalog = useCatalogStore();

const recipe = ref(null);
const author = ref(null);
const loading = ref(true);
const notFound = ref(false);
const error = ref(null);
const notFoundBox = ref(null);
const shareModal = ref(null);

const shareUrl = computed(() =>
  typeof window !== 'undefined' ? window.location.href : '',
);

async function load(id) {
  recipe.value = null;
  author.value = null;
  notFound.value = false;
  error.value = null;
  loading.value = true;
  document.title = 'Рецепт — RecipeHub';

  try {
    const data = await recipesApi.get(id);
    recipe.value = data;
    document.title = `${data.title} — RecipeHub`;
    author.value = await catalog.ensureUser(data.userId);
  } catch (err) {
    if (err?.status === 404) {
      notFound.value = true;
      document.title = 'Рецепт не найден — RecipeHub';
      loading.value = false;
      await nextTick();
      notFoundBox.value?.focus();
    } else {
      error.value = err;
    }
  } finally {
    loading.value = false;
  }
}

function openShare() {
  shareModal.value?.open();
}

watch(
  () => route.params.id,
  (id) => {
    if (id) load(id);
  },
  { immediate: true },
);
</script>

<template>
  <main id="main-content" class="rh-page py-4 py-lg-5" tabindex="-1">
    <div class="container">
      <div v-if="loading" class="alert alert-light border" role="status">
        Загрузка рецепта…
      </div>

      <div
        v-else-if="notFound"
        ref="notFoundBox"
        class="alert alert-warning"
        role="alert"
        tabindex="-1"
      >
        <h1 class="h4">Рецепт не найден</h1>
        <p class="mb-0">
          Вернитесь к
          <RouterLink class="alert-link" to="/search">
            поиску рецептов
          </RouterLink>.
        </p>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        <h1 class="h4">Не удалось загрузить рецепт</h1>
        <p class="mb-0">
          {{ error.message || 'Попробуйте обновить страницу.' }}
        </p>
      </div>

      <article v-else-if="recipe" aria-labelledby="recipe-title">
        <nav aria-label="Хлебные крошки">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <RouterLink to="/">Главная</RouterLink>
            </li>
            <li class="breadcrumb-item">
              <RouterLink to="/search">Поиск</RouterLink>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ recipe.title }}
            </li>
          </ol>
        </nav>

        <div class="row g-4">
          <!-- Основная колонка -->
          <div class="col-12 col-lg-8">
            <img
              :src="assetUrl(recipe.image)"
              :alt="`Фотография блюда «${recipe.title}»`"
              class="img-fluid rounded border w-100 rh-card-image mb-4"
            >

            <h1 class="h2 mb-2" id="recipe-title">{{ recipe.title }}</h1>

            <div class="d-flex flex-wrap gap-3 text-muted mb-3">
              <span class="d-inline-flex align-items-center gap-1">
                <BaseIcon name="clock" />
                <span class="visually-hidden">
                  Время приготовления:
                </span>
                <span>{{ formatDuration(recipe.timeMinutes) }}</span>
              </span>
              <span>Сложность: {{ recipe.difficulty }}</span>
              <span>Порций: {{ recipe.servings }}</span>
              <span class="badge rh-badge">{{ recipe.dishType }}</span>
            </div>

            <p class="lead">{{ recipe.description }}</p>

            <RecipeActions :recipe="recipe" @share="openShare" />

            <!-- Ингредиенты -->
            <section
              class="card card-body shadow-sm mb-4"
              aria-labelledby="ingredients-heading"
            >
              <h2 class="h5" id="ingredients-heading">Ингредиенты</h2>
              <ul class="mb-0">
                <li v-for="item in recipe.ingredients" :key="item">
                  {{ item }}
                </li>
              </ul>
            </section>


            <!-- Шаги приготовления -->
            <section
              class="card card-body shadow-sm mb-4"
              aria-labelledby="steps-heading"
            >
              <h2 class="h5" id="steps-heading">
                Пошаговое приготовление
              </h2>
              <ol class="list-unstyled mb-0">
                <li
                  v-for="(step, index) in recipe.steps"
                  :key="index"
                  class="d-flex gap-3"
                  :class="{ 'mt-3': index }"
                >
                  <span class="rh-step-number" aria-hidden="true">
                    {{ index + 1 }}
                  </span>
                  <p class="mb-0 pt-1">{{ step }}</p>
                </li>
              </ol>
            </section>

            <!-- Видео -->
            <section
              v-if="recipe.videoUrl"
              class="card card-body shadow-sm mb-4"
              aria-labelledby="video-heading"
            >
              <h2 class="h5" id="video-heading">
                <BaseIcon name="play" class="me-2" />Видео приготовления
              </h2>
              <div class="ratio ratio-16x9">
                <iframe
                  :src="recipe.videoUrl"
                  :title="`Видео приготовления: ${recipe.title}`"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </section>

            <CommentsSection :recipe-id="recipe.id" />
          </div>

          <!-- Боковая колонка: автор -->
          <aside class="col-12 col-lg-4" aria-label="Об авторе">
            <h2 class="visually-hidden">Об авторе</h2>
            <div class="sticky-lg-top" style="top: 1rem">
              <AuthorCard
                v-if="author"
                :author="author"
                :heading-level="3"
              >
                <template #footer>
                  <RouterLink
                    class="btn btn-outline-secondary btn-sm w-100"
                    to="/search"
                  >
                    Другие рецепты
                  </RouterLink>
                </template>
              </AuthorCard>
              <div v-else class="alert alert-light border mb-0" role="status">
                Автор не найден.
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>

    <ShareModal
      ref="shareModal"
      :url="shareUrl"
    />
  </main>
</template>

