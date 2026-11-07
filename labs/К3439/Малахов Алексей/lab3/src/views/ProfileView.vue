<template>
  <base-layout>
    <loading-state v-if="loading && !data" />
    <error-alert v-else-if="error" :error="error" />
    <template v-else-if="data">
      <section class="panel mb-4">
        <div class="d-flex flex-column flex-md-row align-items-md-center gap-3">
          <span class="avatar avatar-lg" aria-hidden="true">{{
            initials(data.profile.name)
          }}</span>
          <div class="flex-grow-1">
            <h1 class="h3 mb-1">{{ data.profile.name }}</h1>
            <p class="text-muted mb-1">
              @{{ data.profile.username }} ·
              {{ data.profile.city || 'город не указан' }} ·
              {{ auth.user?.email }}
            </p>
            <p class="mb-0">{{ data.profile.bio }}</p>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button
              type="button"
              class="btn btn-outline-primary"
              @click="profileModal.show()"
            >
              Редактировать профиль
            </button>
            <button
              type="button"
              class="btn btn-primary d-inline-flex align-items-center gap-2"
              @click="recipeModal.show()"
            >
              <app-icon name="plus" /> Новый рецепт
            </button>
          </div>
        </div>
        <div class="d-flex flex-wrap gap-4 mt-3" aria-live="polite">
          <span>{{
            plural(data.published.length, ['публикация', 'публикации', 'публикаций'])
          }}</span>
          <span>Сохранено: {{ savedRecipes.length }}</span>
          <span>{{
            plural(data.following.length, ['подписка', 'подписки', 'подписок'])
          }}</span>
        </div>
      </section>

      <ul class="nav nav-tabs mb-4" role="tablist" aria-label="Разделы кабинета">
        <li v-for="tab in tabs" :key="tab.id" class="nav-item" role="presentation">
          <button
            :id="`${tab.id}-tab`"
            class="nav-link"
            :class="{ active: activeTab === tab.id }"
            type="button"
            role="tab"
            :aria-controls="tab.id"
            :aria-selected="String(activeTab === tab.id)"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>

      <div
        v-for="tab in tabs"
        v-show="activeTab === tab.id"
        :id="tab.id"
        :key="tab.id"
        role="tabpanel"
        :aria-labelledby="`${tab.id}-tab`"
        tabindex="0"
      >
        <h2 class="visually-hidden">{{ tab.label }}</h2>
        <recipe-grid
          v-if="tab.id === 'published'"
          :recipes="data.published"
          empty-text="Вы ещё ничего не опубликовали. Нажмите «Новый рецепт»."
        >
          <template #actions="{ recipe }">
            <button
              type="button"
              class="btn btn-sm btn-outline-danger ms-auto"
              :aria-label="`Удалить рецепт «${recipe.title}»`"
              :disabled="busy.has(`recipe-${recipe.id}`)"
              @click="removeRecipe(recipe)"
            >
              Удалить
            </button>
          </template>
        </recipe-grid>
        <recipe-grid
          v-if="tab.id === 'saved'"
          :recipes="savedRecipes"
          :loading="savedLoading"
          empty-text="Сохранённых рецептов нет. Нажмите «Сохранить» на карточке рецепта."
        />
        <div v-if="tab.id === 'following'" class="row g-4">
          <p v-if="data.following.length === 0" class="col-12 empty-state">
            Вы пока ни на кого не подписаны.
          </p>
          <div
            v-for="follow in data.following"
            :key="follow.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <author-panel
              :name="nameOf(follow.authorId)"
              :link="{ name: 'author', params: { id: follow.authorId } }"
            >
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary btn-unfollow"
                :aria-label="`Отписаться от ${nameOf(follow.authorId)}`"
                :disabled="busy.has(`follow-${follow.id}`)"
                @click="unfollow(follow)"
              >
                Отписаться
              </button>
            </author-panel>
          </div>
        </div>
      </div>

      <profile-form-modal
        ref="profileModal"
        :profile="data.profile"
        @saved="onProfileSaved"
      />
      <recipe-form-modal
        ref="recipeModal"
        @created="(recipe) => data.published.push(recipe)"
      />
    </template>
  </base-layout>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import { followsApi, profilesApi, recipesApi } from '@/api'
import AppIcon from '@/components/AppIcon.vue'
import AuthorPanel from '@/components/AuthorPanel.vue'
import ErrorAlert from '@/components/ErrorAlert.vue'
import LoadingState from '@/components/LoadingState.vue'
import ProfileFormModal from '@/components/ProfileFormModal.vue'
import RecipeFormModal from '@/components/RecipeFormModal.vue'
import RecipeGrid from '@/components/RecipeGrid.vue'
import { useAsync } from '@/composables/useAsync'
import { useNotify } from '@/composables/useNotify'
import { useProfiles } from '@/composables/useProfiles'
import { useSaved } from '@/composables/useSaved'
import BaseLayout from '@/layouts/BaseLayout.vue'
import useAuthStore from '@/stores/auth'
import { initials, plural } from '@/utils/format'

const tabs = [
  { id: 'published', label: 'Мои публикации' },
  { id: 'saved', label: 'Сохранённые' },
  { id: 'following', label: 'Подписки' },
]

const auth = useAuthStore()
const { nameOf, remember } = useProfiles()
const { notify } = useNotify()
const { saved, load: loadSaved } = useSaved()
const activeTab = ref('published')
const profileModal = ref(null)
const recipeModal = ref(null)
const savedRecipes = ref([])
const savedLoading = ref(false)
const busy = ref(new Set())

const { data, loading, error, run } = useAsync(async () => {
  const [profile, published, following] = await Promise.all([
    profilesApi.getOne(auth.userId),
    recipesApi.getAll({ userId: auth.userId }),
    followsApi.find({ userId: auth.userId }),
  ])
  return { profile: profile.data, published: published.data, following: following.data }
})

async function refreshSaved() {
  const ids = [...saved.value.keys()]
  savedLoading.value = true
  try {
    savedRecipes.value = ids.length ? (await recipesApi.getAll({ id: ids })).data : []
  } catch (err) {
    notify(err.message)
  } finally {
    savedLoading.value = false
  }
}

async function withBusy(key, action) {
  if (busy.value.has(key)) return
  busy.value = new Set(busy.value).add(key)
  try {
    await action()
  } finally {
    const rest = new Set(busy.value)
    rest.delete(key)
    busy.value = rest
  }
}

function removeRecipe(recipe) {
  return withBusy(`recipe-${recipe.id}`, async () => {
    try {
      await recipesApi.remove(recipe.id)
    } catch (err) {
      if (err.status !== 404) {
        notify(err.message)
        return
      }
    }
    data.value.published = data.value.published.filter((item) => item.id !== recipe.id)
    await loadSaved(true)
  })
}

function unfollow(follow) {
  return withBusy(`follow-${follow.id}`, async () => {
    try {
      await followsApi.remove(follow.id)
    } catch (err) {
      if (err.status !== 404) {
        notify(err.message)
        return
      }
    }
    data.value.following = data.value.following.filter((item) => item.id !== follow.id)
  })
}

function onProfileSaved(profile) {
  data.value.profile = profile
  remember(profile)
  auth.setName(profile.name)
}

watch(saved, refreshSaved)

onMounted(async () => {
  try {
    await Promise.all([run(), loadSaved()])
    await refreshSaved()
  } catch (err) {
    notify(err.message)
  }
})
</script>
