<script setup>
/**
 * HomeView.vue — главная страница: hero, быстрый поиск,
 * популярные рецепты и популярные кулинары.
 */

import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import BaseIcon from '@/components/BaseIcon.vue';
import RecipeGrid from '@/components/RecipeGrid.vue';
import AuthorCard from '@/components/AuthorCard.vue';
import { useCatalogStore } from '@/stores/catalog';
import { recipes as recipesApi } from '@/api/resources';

const router = useRouter();
const catalog = useCatalogStore();

const quickQuery = ref('');

const popularRecipes = ref([]);
const recipesLoading = ref(true);
const recipesError = ref(null);

const authorsLoading = ref(true);
const authorsError = ref(null);

const popularAuthors = computed(() =>
  [...catalog.users]
    .sort((a, b) => Number(b.subscribers || 0) - Number(a.subscribers || 0))
    .slice(0, 3),
);

async function loadRecipes() {
  recipesLoading.value = true;
  recipesError.value = null;

  try {
    popularRecipes.value = await recipesApi.list({
      _sort: 'likes',
      _order: 'desc',
      _limit: 6,
    });
  } catch (error) {
    recipesError.value = error;
  } finally {
    recipesLoading.value = false;
  }
}

async function loadAuthors() {
  authorsLoading.value = true;
  authorsError.value = null;

  try {
    await catalog.loadUsers();
  } catch (error) {
    authorsError.value = error;
  } finally {
    authorsLoading.value = false;
  }
}

function submitQuickSearch() {
  const query = quickQuery.value.trim();
  router.push({
    name: 'search',
    query: query ? { query } : {},
  });
}

onMounted(() => {
  loadRecipes();
  loadAuthors();
});
</script>

<template>
  <main id="main-content" class="rh-page" tabindex="-1">
    <!-- Приветственный блок -->
    <section class="bg-body border-bottom py-5" aria-labelledby="hero-title">
      <div class="container">
        <div class="row align-items-center g-4">
          <div class="col-lg-7">
            <h1 class="display-6 fw-semibold" id="hero-title">
              Делитесь рецептами и находите новые блюда
            </h1>
            <p class="lead text-muted mb-4">
              RecipeHub — это сообщество кулинаров. Публикуйте собственные
              рецепты, сохраняйте чужие и подписывайтесь на авторов, чья кухня
              вам по душе.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <RouterLink class="btn btn-rh-primary btn-lg" to="/search">
                Найти рецепт
              </RouterLink>
              <RouterLink
                class="btn btn-outline-secondary btn-lg"
                to="/register"
              >
                Присоединиться
              </RouterLink>
            </div>
          </div>

          <div class="col-lg-5">
            <form
              class="card card-body shadow-sm"
              role="search"
              aria-label="Быстрый поиск рецептов"
              @submit.prevent="submitQuickSearch"
            >
              <label class="form-label fw-semibold" for="home-search">
                Быстрый поиск по названию
              </label>
              <div class="input-group">
                <input
                  id="home-search"
                  v-model="quickQuery"
                  class="form-control"
                  type="search"
                  name="query"
                  autocomplete="off"
                  aria-describedby="home-search-hint"
                  placeholder="Например, паста карбонара"
                >
                <button class="btn btn-rh-primary" type="submit">
                  <BaseIcon name="search" class="me-1" />
                  Найти
                </button>
              </div>
              <p class="form-text mb-0" id="home-search-hint">
                На следующей странице доступны фильтры по типу блюда,
                сложности и ингредиентам.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Популярные рецепты -->
    <section class="py-5" aria-labelledby="popular-recipes-title">
      <div class="container">
        <div class="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 class="h3 mb-1" id="popular-recipes-title">
              <BaseIcon name="star" class="me-2" />Популярные рецепты
            </h2>
            <p class="text-muted mb-0">
              Самое обсуждаемое и любимое сообществом.
            </p>
          </div>
          <RouterLink
            class="btn btn-outline-secondary d-none d-md-inline-block"
            to="/search"
          >
            Все рецепты
          </RouterLink>
        </div>

        <RecipeGrid
          :recipes="popularRecipes"
          :loading="recipesLoading"
          :error="recipesError"
          empty-text="Пока нет опубликованных рецептов."
          row-class="row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
        />
      </div>
    </section>


    <!-- Популярные кулинары -->
    <section
      class="py-5 bg-body border-top"
      aria-labelledby="popular-authors-title"
    >
      <div class="container">
        <h2 class="h3 mb-4" id="popular-authors-title">
          <BaseIcon name="users" class="me-2" />Популярные кулинары
        </h2>

        <div class="row row-cols-1 row-cols-md-3 g-4">
          <div v-if="authorsLoading" class="col-12">
            <div
              class="alert alert-light border text-center mb-0"
              role="status"
            >
              Загрузка кулинаров…
            </div>
          </div>

          <div v-else-if="authorsError" class="col-12">
            <div class="alert alert-danger mb-0" role="alert">
              {{ authorsError.message || 'Не удалось загрузить кулинаров.' }}
            </div>
          </div>

          <div v-else-if="!popularAuthors.length" class="col-12">
            <div
              class="alert alert-light border text-center mb-0"
              role="status"
            >
              Пока нет зарегистрированных кулинаров.
            </div>
          </div>

          <template v-else>
            <div
              v-for="author in popularAuthors"
              :key="author.id"
              class="col"
            >
              <AuthorCard :author="author" />
            </div>
          </template>
        </div>
      </div>
    </section>
  </main>
</template>

