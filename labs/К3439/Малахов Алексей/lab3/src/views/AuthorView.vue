<template>
  <base-layout>
    <loading-state v-if="loading" />
    <div v-else-if="error" class="empty-state">
      <h1 class="h3">
        {{ error.status === 404 ? 'Кулинар не найден' : error.message }}
      </h1>
      <p><router-link :to="{ name: 'home' }">На главную</router-link></p>
    </div>
    <template v-else-if="data">
      <section class="panel mb-4">
        <div class="d-flex flex-column flex-md-row align-items-md-center gap-3">
          <span class="avatar avatar-lg" aria-hidden="true">{{
            initials(data.profile.name)
          }}</span>
          <div class="flex-grow-1">
            <h1 class="h3 mb-1">{{ data.profile.name }}</h1>
            <p class="text-muted mb-1">
              @{{ data.profile.username
              }}<template v-if="data.profile.city"> · {{ data.profile.city }}</template>
              · {{ plural(followers, ['подписчик', 'подписчика', 'подписчиков']) }} ·
              {{ plural(data.recipes.length, ['рецепт', 'рецепта', 'рецептов']) }}
            </p>
            <p class="mb-0">{{ data.profile.bio }}</p>
          </div>
          <follow-button
            :following="following"
            :busy="followBusy"
            @toggle="toggleFollow"
          />
        </div>
      </section>

      <h2 class="h4 mb-3">Рецепты автора</h2>
      <recipe-grid :recipes="data.recipes" empty-text="У автора пока нет рецептов" />
    </template>
  </base-layout>
</template>

<script setup>
import { toRef, watch } from 'vue'

import { profilesApi, recipesApi } from '@/api'
import FollowButton from '@/components/FollowButton.vue'
import LoadingState from '@/components/LoadingState.vue'
import RecipeGrid from '@/components/RecipeGrid.vue'
import { useAsync } from '@/composables/useAsync'
import { useFollow } from '@/composables/useFollow'
import { useNotify } from '@/composables/useNotify'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { initials, plural } from '@/utils/format'

const { notify } = useNotify()

const props = defineProps({
  id: { type: Number, required: true },
})

const { data, loading, error, run } = useAsync(async (id) => {
  const [profile, recipes] = await Promise.all([
    profilesApi.getOne(id),
    recipesApi.getAll({ userId: id }),
  ])
  return { profile: profile.data, recipes: recipes.data }
})

const {
  following,
  followers,
  busy: followBusy,
  load: loadFollows,
  toggle: toggleFollow,
} = useFollow(toRef(props, 'id'))

watch(
  () => props.id,
  async (id) => {
    await run(id)
    if (data.value) {
      document.title = `${data.value.profile.name}: Вкусная лента`
      await loadFollows().catch((err) => notify(err.message))
    }
  },
  { immediate: true },
)
</script>
