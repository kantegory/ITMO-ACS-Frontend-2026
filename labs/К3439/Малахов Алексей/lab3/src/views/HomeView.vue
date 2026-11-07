<template>
  <base-layout>
    <section class="hero mb-5" aria-labelledby="heroTitle">
      <div class="row align-items-center g-4">
        <div class="col-lg-7">
          <h1 id="heroTitle" class="mb-3">Делитесь рецептами и находите новые</h1>
          <p class="lead mb-4">
            Домашние рецепты с пошаговыми инструкциями, фото и видео от кулинаров, на
            которых можно подписаться.
          </p>
          <form
            class="d-flex flex-column flex-sm-row gap-2"
            role="search"
            @submit.prevent="search"
          >
            <label for="heroSearch" class="visually-hidden">Поиск рецептов</label>
            <input
              id="heroSearch"
              v-model="query"
              class="form-control form-control-lg"
              type="search"
              placeholder="Например, сырники"
            />
            <button
              class="btn btn-primary btn-lg d-inline-flex align-items-center justify-content-center gap-2"
              type="submit"
            >
              <app-icon name="search" /> Найти
            </button>
          </form>
        </div>
        <div class="col-lg-5">
          <nav class="d-flex flex-wrap gap-2" aria-label="Типы блюд">
            <router-link
              v-for="type in DISH_TYPES"
              :key="type"
              class="btn btn-chip"
              :to="{ name: 'search', query: { type } }"
            >
              {{ type }}
            </router-link>
          </nav>
        </div>
      </div>
    </section>

    <section class="mb-5">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h3 mb-0">Популярные рецепты</h2>
        <router-link :to="{ name: 'search' }">Все рецепты</router-link>
      </div>
      <recipe-grid :recipes="popular" :loading="loading" :error="error" />
    </section>

    <section v-if="authors.length" class="mb-4">
      <h2 class="h3 mb-3">Кулинары</h2>
      <div class="row g-4">
        <div v-for="author in authors" :key="author.id" class="col-12 col-md-4">
          <router-link
            class="panel d-flex gap-3 align-items-center text-decoration-none text-reset h-100"
            :to="{ name: 'author', params: { id: author.id } }"
          >
            <span class="avatar" aria-hidden="true">{{ initials(author.name) }}</span>
            <span>
              <span class="d-block fw-medium">{{ author.name }}</span>
              <span class="d-block text-muted small">
                {{ plural(author.recipes, ['рецепт', 'рецепта', 'рецептов']) }} ·
                {{
                  plural(author.followers, ['подписчик', 'подписчика', 'подписчиков'])
                }}
              </span>
            </span>
          </router-link>
        </div>
      </div>
    </section>
  </base-layout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { followsApi, recipesApi } from '@/api'
import AppIcon from '@/components/AppIcon.vue'
import RecipeGrid from '@/components/RecipeGrid.vue'
import { useAsync } from '@/composables/useAsync'
import { useProfiles } from '@/composables/useProfiles'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { initials, plural } from '@/utils/format'
import { DISH_TYPES } from '@/utils/recipes'

const router = useRouter()
const query = ref('')
const { profiles } = useProfiles()

const { data, loading, error, run } = useAsync(async () => {
  const [recipes, follows] = await Promise.all([recipesApi.getAll(), followsApi.find()])
  return { recipes: recipes.data, follows: follows.data }
})

const popular = computed(() =>
  [...(data.value?.recipes || [])]
    .sort((a, b) => b.likes.length - a.likes.length)
    .slice(0, 6),
)

const authors = computed(() => {
  if (!data.value) return []
  return [...profiles.value.values()]
    .map((profile) => ({
      ...profile,
      recipes: data.value.recipes.filter((recipe) => recipe.userId === profile.id)
        .length,
      followers: data.value.follows.filter((follow) => follow.authorId === profile.id)
        .length,
    }))
    .filter((author) => author.recipes > 0)
})

function search() {
  router.push({
    name: 'search',
    query: query.value.trim() ? { q: query.value.trim() } : {},
  })
}

onMounted(run)
</script>
