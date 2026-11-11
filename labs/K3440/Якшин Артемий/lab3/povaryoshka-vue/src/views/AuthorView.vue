<script setup>
import { computed, ref, watch } from 'vue'

import { recipesApi, socialApi, usersApi } from '@/api'
import EmptyState from '@/components/EmptyState.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ProfileHeader from '@/components/ProfileHeader.vue'
import RecipeGrid from '@/components/RecipeGrid.vue'
import { useApiError } from '@/composables/useApiError'
import { useFollow } from '@/composables/useFollow'
import { useSaved } from '@/composables/useSaved'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { plural } from '@/utils/format'

const props = defineProps({
  id: { type: Number, required: true }
})

const { handleError } = useApiError()
const { followers, isFollowing, isMe, loadFollowers, toggleFollow } = useFollow(() => props.id)
const { saved, loadSaved, toggleSave } = useSaved()

const author = ref(null)
const recipes = ref([])
const following = ref(0)
const loading = ref(true)
const notFound = ref(false)

const stats = computed(() => [
  { value: recipes.value.length, label: plural(recipes.value.length, 'рецепт', 'рецепта', 'рецептов') },
  { value: followers.value.length, label: plural(followers.value.length, 'подписчик', 'подписчика', 'подписчиков') },
  { value: following.value, label: plural(following.value, 'подписка', 'подписки', 'подписок') }
])

async function load() {
  loading.value = true
  notFound.value = false
  try {
    const [user, list, subs] = await Promise.all([
      usersApi.getById(props.id),
      recipesApi.getAll({ userId: props.id, _sort: 'createdAt', _order: 'desc' }),
      socialApi.getSubscriptions({ userId: props.id }),
      loadFollowers(),
      loadSaved()
    ])
    author.value = user.data
    recipes.value = list.data
    following.value = subs.data.length
    document.title = `${author.value.name} — Поварёшка`
  } catch (error) {
    if (error.response?.status === 404) notFound.value = true
    else handleError(error)
  } finally {
    loading.value = false
  }
}

watch(() => props.id, load, { immediate: true })
</script>

<template>
  <BaseLayout>
    <LoadingSpinner v-if="loading" />

    <div v-else-if="notFound || !author" class="container">
      <EmptyState class="my-5"><p class="h5 mb-0">Кулинар не найден</p></EmptyState>
    </div>

    <template v-else>
      <ProfileHeader :user="author" :stats="stats">
        <template #actions>
          <RouterLink v-if="isMe" class="btn btn-soft" :to="{ name: 'profile' }">Перейти в кабинет</RouterLink>
          <button v-else class="btn btn-accent btn-toggle" :class="{ 'is-active': isFollowing }" type="button" @click="toggleFollow">
            {{ isFollowing ? 'Вы подписаны' : 'Подписаться' }}
          </button>
        </template>
      </ProfileHeader>

      <section class="container py-4">
        <h2 class="h3 mb-4">Рецепты автора</h2>
        <RecipeGrid v-if="recipes.length" :recipes="recipes" :saved-ids="saved" @toggle-save="toggleSave" />
        <EmptyState v-else>У автора пока нет рецептов.</EmptyState>
      </section>
    </template>
  </BaseLayout>
</template>
