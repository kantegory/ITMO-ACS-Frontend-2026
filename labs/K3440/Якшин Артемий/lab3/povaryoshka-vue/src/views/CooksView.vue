<script setup>
import { onMounted, ref } from 'vue'

import { recipesApi, socialApi, usersApi } from '@/api'
import CookCard from '@/components/CookCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useApiError } from '@/composables/useApiError'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { countLabel } from '@/utils/format'

const { handleError } = useApiError()

const cooks = ref([])
const loading = ref(true)

function countBy(items, key) {
  return items.reduce((acc, item) => acc.set(item[key], (acc.get(item[key]) ?? 0) + 1), new Map())
}

onMounted(async () => {
  try {
    const [users, recipes, subscriptions] = await Promise.all([
      usersApi.getAll(),
      recipesApi.getAll(),
      socialApi.getSubscriptions()
    ])
    const recipesCount = countBy(recipes.data, 'userId')
    const followersCount = countBy(subscriptions.data, 'authorId')

    // кулинары — те, у кого есть хотя бы один рецепт; популярные выше
    cooks.value = users.data
      .filter((user) => recipesCount.has(user.id))
      .map((user) => ({
        user,
        followers: followersCount.get(user.id) ?? 0,
        meta: `${countLabel(recipesCount.get(user.id), 'рецепт', 'рецепта', 'рецептов')} · ${countLabel(followersCount.get(user.id) ?? 0, 'подписчик', 'подписчика', 'подписчиков')}`
      }))
      .sort((a, b) => b.followers - a.followers)
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <BaseLayout>
    <section class="container py-5">
      <h1 class="mb-2">Кулинары</h1>
      <p class="text-muted-warm mb-4">Подписывайтесь на авторов, чтобы не пропустить их новые рецепты.</p>
      <LoadingSpinner v-if="loading" />
      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
        <div v-for="cook in cooks" :key="cook.user.id" class="col">
          <CookCard :user="cook.user" :meta="cook.meta" />
        </div>
      </div>
    </section>
  </BaseLayout>
</template>
