<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-celestials" aria-hidden="true">
      <div class="hero-sun" />
      <div class="hero-moon" />
    </div>
    <HeroSkyline />
    <div class="container hero-inner">
      <p class="hero-eyebrow">Рецепты · Блоги · Сообщество</p>
      <h1 id="hero-title">Готовь под&nbsp;закат</h1>
      <p class="hero-lead">
        Обмен рецептами и кулинарные блоги: морепродукты, цитрусы, уличная еда и домашние десерты.
      </p>
      <div class="hero-actions">
        <a class="btn btn-vice btn-vice-primary" href="#catalog">Смотреть рецепты</a>
        <button
          type="button"
          class="btn btn-vice btn-vice-outline"
          data-bs-toggle="modal"
          data-bs-target="#aboutModal"
        >
          Что это?
        </button>
      </div>
    </div>
  </section>

  <section id="catalog" class="section">
    <div class="container">
      <h2 class="section-title">
        <Icon name="filter" />
        Каталог рецептов
      </h2>
      <p class="section-sub">
        Фильтруй по типу, сложности и ингредиентам — отбор делает сервер.
      </p>

      <div v-if="apiDown" class="empty-state">
        <h3 class="display">API не запущен</h3>
        <p class="mb-0">
          В папке lab3 выполни <code>npm run api</code> (порт 3000), затем обнови страницу.
        </p>
      </div>

      <template v-else>
        <FilterPanel
          v-model="filters"
          :ingredients="allIngredients"
          :count="filteredRecipes.length"
          @reset="resetFilters"
        />

        <p v-if="error" class="alert alert-danger">{{ error }}</p>
        <p v-if="loading" class="text-muted">Загрузка…</p>

        <div v-else class="recipe-grid" aria-live="polite">
          <div
            v-if="!filteredRecipes.length"
            class="empty-state"
            style="grid-column: 1 / -1"
          >
            <h3 class="display">Ничего не нашлось</h3>
            <p>Сбрось фильтры или попробуй другой запрос.</p>
          </div>
          <RecipeCard
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            :recipe="recipe"
            :author="getAuthor(recipe.authorId)"
            :liked="likedIds.has(Number(recipe.id))"
            @like-update="onLikeUpdate"
          />
        </div>
      </template>
    </div>
  </section>

  <div
    id="aboutModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="aboutModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="aboutModalLabel" class="modal-title">Про VICE BITES</h2>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Закрыть"
          />
        </div>
        <div class="modal-body">
          <p>
            Платформа для обмена рецептами и кулинарных блогов: каталог, фильтры, лайки,
            комментарии и личный кабинет.
          </p>
          <p class="mb-0">
            ЛР3: SPA на Vue&nbsp;3 (router, axios, pinia, composable).
          </p>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-vice btn-vice-primary"
            data-bs-dismiss="modal"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import HeroSkyline from '@/components/HeroSkyline.vue'
import Icon from '@/components/Icon.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { useRecipes } from '@/composables/useRecipes'

const {
  filteredRecipes,
  allIngredients,
  filters,
  likedIds,
  loading,
  error,
  apiDown,
  loadCatalog,
  resetFilters,
  getAuthor,
  setLiked,
  updateRecipeLikes,
} = useRecipes()

onMounted(loadCatalog)

function onLikeUpdate({ recipeId, liked, likes }) {
  setLiked(recipeId, liked)
  updateRecipeLikes(recipeId, likes)
}
</script>
