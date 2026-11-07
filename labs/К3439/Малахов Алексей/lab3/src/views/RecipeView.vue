<template>
  <base-layout>
    <nav aria-label="Навигационная цепочка">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{ name: 'home' }">Главная</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link :to="{ name: 'search' }">Рецепты</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          {{ recipe?.title || 'Рецепт' }}
        </li>
      </ol>
    </nav>

    <loading-state v-if="loading" />
    <div v-else-if="error" class="empty-state">
      <h1 class="h3">
        {{ error.status === 404 ? 'Рецепт не найден' : 'Не удалось загрузить рецепт' }}
      </h1>
      <p>
        {{ error.status === 404 ? 'Возможно, его удалили.' : error.message }}
        <router-link :to="{ name: 'search' }">Вернуться к поиску</router-link>
      </p>
    </div>

    <article v-else-if="recipe">
      <div class="row g-4 mb-4">
        <div class="col-lg-7">
          <img class="recipe-hero-img" :src="recipe.image" :alt="recipe.title" />
        </div>
        <div class="col-lg-5 d-flex flex-column gap-3">
          <div class="d-flex flex-wrap gap-2">
            <span class="badge badge-type">{{ recipe.type }}</span>
            <span class="badge badge-difficulty">{{ recipe.difficulty }}</span>
          </div>
          <h1 class="h2 mb-0">{{ recipe.title }}</h1>
          <p class="mb-0">{{ recipe.description }}</p>
          <div class="meta">
            <span><app-icon name="clock" /> {{ recipe.time }} мин</span>
            <span><app-icon name="servings" /> {{ recipe.servings }} порц.</span>
          </div>
          <author-panel
            :name="nameOf(recipe.userId)"
            :link="
              isMine
                ? { name: 'profile' }
                : { name: 'author', params: { id: recipe.userId } }
            "
            :subtitle="
              isMine
                ? 'Ваш рецепт'
                : plural(followers, ['подписчик', 'подписчика', 'подписчиков'])
            "
          >
            <follow-button
              v-if="!isMine"
              class="btn-sm"
              :following="following"
              :busy="followBusy"
              @toggle="toggleFollow"
            />
          </author-panel>
          <div
            class="d-flex flex-wrap gap-2"
            role="group"
            aria-label="Действия с рецептом"
          >
            <like-button :recipe="recipe" />
            <save-button :recipe-id="recipe.id" />
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-4">
          <section class="panel">
            <h2 class="h4 mb-3">Ингредиенты</h2>
            <ul class="list-unstyled mb-0">
              <li
                v-for="(item, index) in recipe.ingredients"
                :key="index"
                class="form-check d-flex justify-content-between gap-2 py-2 border-bottom"
              >
                <span>
                  <input
                    :id="`ingredient${index}`"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label" :for="`ingredient${index}`">{{
                    item.name
                  }}</label>
                </span>
                <span class="text-muted text-nowrap">{{ item.amount }}</span>
              </li>
            </ul>
          </section>
        </div>
        <div class="col-lg-8">
          <section class="panel mb-4">
            <h2 class="h4 mb-3">Пошаговый рецепт</h2>
            <ol class="steps mb-0">
              <li v-for="(step, index) in recipe.steps" :key="index">{{ step }}</li>
            </ol>
          </section>

          <section class="panel mb-4">
            <h2 class="h4 mb-3">Видео</h2>
            <video
              v-if="recipe.video"
              class="recipe-video"
              controls
              preload="metadata"
              :poster="recipe.image"
              :aria-label="`Видео: ${recipe.title}`"
            >
              <source :src="recipe.video" type="video/webm" />
              Ваш браузер не поддерживает видео.
            </video>
            <p v-else class="text-muted mb-0">
              Автор пока не добавил видео к этому рецепту.
            </p>
          </section>

          <comment-section
            :recipe-id="recipe.id"
            :comments="recipe.comments"
            @added="(comment) => recipe.comments.push(comment)"
          />
        </div>
      </div>
    </article>
  </base-layout>
</template>

<script setup>
import { computed, watch } from 'vue'

import { recipesApi } from '@/api'
import AppIcon from '@/components/AppIcon.vue'
import AuthorPanel from '@/components/AuthorPanel.vue'
import CommentSection from '@/components/CommentSection.vue'
import FollowButton from '@/components/FollowButton.vue'
import LikeButton from '@/components/LikeButton.vue'
import LoadingState from '@/components/LoadingState.vue'
import SaveButton from '@/components/SaveButton.vue'
import { useAsync } from '@/composables/useAsync'
import { useFollow } from '@/composables/useFollow'
import { useNotify } from '@/composables/useNotify'
import { useProfiles } from '@/composables/useProfiles'
import BaseLayout from '@/layouts/BaseLayout.vue'
import useAuthStore from '@/stores/auth'
import { plural } from '@/utils/format'

const { notify } = useNotify()

const props = defineProps({
  id: { type: Number, required: true },
})

const auth = useAuthStore()
const { nameOf } = useProfiles()

const {
  data: recipe,
  loading,
  error,
  run,
} = useAsync(async (id) => {
  const { data } = await recipesApi.getOne(id)
  return data
})

const authorId = computed(() => recipe.value?.userId)
const isMine = computed(() => auth.isAuthenticated && auth.userId === authorId.value)
const {
  following,
  followers,
  busy: followBusy,
  load: loadFollows,
  toggle: toggleFollow,
} = useFollow(authorId)

watch(
  () => props.id,
  async (id) => {
    await run(id)
    if (recipe.value) {
      document.title = `${recipe.value.title}: Вкусная лента`
      await loadFollows().catch((err) => notify(err.message))
    }
  },
  { immediate: true },
)
</script>
