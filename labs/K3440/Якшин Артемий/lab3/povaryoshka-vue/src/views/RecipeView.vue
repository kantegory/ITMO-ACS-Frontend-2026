<script setup>
import { computed, ref, watch } from 'vue'

import { recipesApi, socialApi } from '@/api'
import BaseIcon from '@/components/BaseIcon.vue'
import CommentsSection from '@/components/CommentsSection.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useApiError } from '@/composables/useApiError'
import { useFollow } from '@/composables/useFollow'
import { useSaved } from '@/composables/useSaved'
import BaseLayout from '@/layouts/BaseLayout.vue'
import useAuthStore from '@/stores/auth'
import { countLabel, youtubeId } from '@/utils/format'

const props = defineProps({
  id: { type: Number, required: true }
})

const auth = useAuthStore()
const { handleError, goToLogin } = useApiError()

const recipe = ref(null)
const likes = ref([])
const authorRecipes = ref(0)
const commentsCount = ref(0)
const loading = ref(true)
const notFound = ref(false)

const { followers, isFollowing, isMe, loadFollowers, toggleFollow } = useFollow(() => recipe.value?.userId)
const { isSaved, loadSaved, toggleSave } = useSaved()

const myLike = computed(() => likes.value.find((like) => like.userId === auth.user?.id))
const video = computed(() => youtubeId(recipe.value?.video ?? ''))

async function load() {
  loading.value = true
  notFound.value = false
  try {
    const [recipeResponse, likesResponse] = await Promise.all([
      recipesApi.getById(props.id),
      socialApi.getLikes({ recipeId: props.id })
    ])
    recipe.value = recipeResponse.data
    likes.value = likesResponse.data
    document.title = `${recipe.value.title} — Поварёшка`

    const [authorResponse] = await Promise.all([
      recipesApi.getAll({ userId: recipe.value.userId }),
      loadFollowers(),
      loadSaved()
    ])
    authorRecipes.value = authorResponse.data.length
  } catch (error) {
    if (error.response?.status === 404) notFound.value = true
    else handleError(error)
  } finally {
    loading.value = false
  }
}

async function toggleLike() {
  if (!auth.isLoggedIn) return goToLogin()
  try {
    if (myLike.value) {
      await socialApi.removeLike(myLike.value.id)
      likes.value = likes.value.filter((like) => like.id !== myLike.value.id)
    } else {
      const { data } = await socialApi.addLike(auth.user.id, props.id)
      likes.value.push(data)
    }
  } catch (error) {
    handleError(error)
  }
}

// страница остаётся той же при переходе с рецепта на рецепт — перезагружаем данные
watch(() => props.id, load, { immediate: true })
</script>

<template>
  <BaseLayout>
    <div class="container py-4">
      <LoadingSpinner v-if="loading" />

      <EmptyState v-else-if="notFound || !recipe">
        <p class="h4">Рецепт не найден</p>
        <RouterLink class="btn btn-accent mt-2" :to="{ name: 'search' }">К рецептам</RouterLink>
      </EmptyState>

      <template v-else>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><RouterLink :to="{ name: 'search' }">Рецепты</RouterLink></li>
            <li class="breadcrumb-item"><RouterLink :to="{ name: 'search', query: { type: recipe.type } }">{{ recipe.type }}</RouterLink></li>
            <li class="breadcrumb-item active" aria-current="page">{{ recipe.title }}</li>
          </ol>
        </nav>

        <div class="row g-4 g-lg-5 align-items-center">
          <div class="col-lg-6">
            <img class="recipe-photo" :src="recipe.image || '/img/recipes/placeholder.svg'" :alt="`Готовое блюдо: ${recipe.title}`">
          </div>
          <div class="col-lg-6">
            <span class="badge badge-soft">{{ recipe.type }}</span>
            <h1 class="recipe-title">{{ recipe.title }}</h1>
            <p class="lead">{{ recipe.description }}</p>

            <div class="author-line">
              <UserAvatar :user="recipe.user" />
              <div class="me-auto">
                <RouterLink class="author-line__name" :to="{ name: 'author', params: { id: recipe.userId } }">{{ recipe.user.name }}</RouterLink>
                <div class="author-line__meta">
                  {{ countLabel(authorRecipes, 'рецепт', 'рецепта', 'рецептов') }} ·
                  {{ countLabel(followers.length, 'подписчик', 'подписчика', 'подписчиков') }}
                </div>
              </div>
              <RouterLink v-if="isMe" class="btn btn-soft btn-sm" :to="{ name: 'profile' }">Это ваш рецепт</RouterLink>
              <button v-else class="btn btn-outline-accent btn-sm btn-toggle" :class="{ 'is-active': isFollowing }" type="button" @click="toggleFollow">
                {{ isFollowing ? 'Вы подписаны' : 'Подписаться' }}
              </button>
            </div>

            <ul class="recipe-facts" aria-label="Коротко о рецепте">
              <li><BaseIcon name="clock" /><span>Время</span><strong>{{ recipe.time }} мин</strong></li>
              <li><BaseIcon name="users" /><span>Порции</span><strong>{{ recipe.servings }}</strong></li>
              <li><BaseIcon name="level" /><span>Сложность</span><strong>{{ recipe.difficulty }}</strong></li>
            </ul>

            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-soft btn-toggle" :class="{ 'is-active': myLike }" type="button" :aria-pressed="Boolean(myLike)" @click="toggleLike">
                <BaseIcon name="heart" /> Нравится {{ likes.length }}
              </button>
              <button class="btn btn-soft btn-toggle" :class="{ 'is-active': isSaved(recipe.id) }" type="button" @click="toggleSave(recipe.id)">
                <BaseIcon name="bookmark" /> {{ isSaved(recipe.id) ? 'В сохранённых' : 'Сохранить' }}
              </button>
              <a class="btn btn-soft" href="#comments">
                <BaseIcon name="comment" /> <span class="visually-hidden">Комментарии:</span> {{ commentsCount }}
              </a>
            </div>
          </div>
        </div>

        <div class="row g-4 g-lg-5 mt-1">
          <div class="col-lg-4">
            <section class="panel">
              <h2 class="panel__title">Ингредиенты</h2>
              <p class="text-muted-warm small">Отмечайте то, что уже есть дома.</p>
              <ul class="ingredients">
                <li v-for="(item, index) in recipe.ingredients" :key="item.name">
                  <div class="form-check mb-0">
                    <input :id="`ing${index}`" class="form-check-input" type="checkbox">
                    <label class="form-check-label" :for="`ing${index}`">{{ item.name }}</label>
                  </div>
                  <span class="ingredients__amount">{{ item.amount }}</span>
                </li>
              </ul>
            </section>
          </div>

          <div class="col-lg-8">
            <section class="panel">
              <h2 class="panel__title">Приготовление</h2>
              <ol class="steps">
                <li v-for="step in recipe.steps" :key="step">{{ step }}</li>
              </ol>
            </section>

            <section v-if="video" class="panel">
              <h2 class="panel__title">Видео-рецепт</h2>
              <div class="ratio ratio-16x9 video-frame">
                <iframe :src="`https://www.youtube-nocookie.com/embed/${video}`" :title="`Видео-рецепт: ${recipe.title}`" loading="lazy" allowfullscreen />
              </div>
            </section>

            <CommentsSection :key="recipe.id" v-model:count="commentsCount" :recipe-id="recipe.id" />
          </div>
        </div>
      </template>
    </div>
  </BaseLayout>
</template>
