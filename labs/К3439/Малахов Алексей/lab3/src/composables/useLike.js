import { computed, ref } from 'vue'

import { likesApi } from '@/api'
import useAuthStore from '@/stores/auth'
import { useNotify } from '@/composables/useNotify'
import { useRequireAuth } from '@/composables/useRequireAuth'

export function useLike(recipe) {
  const auth = useAuthStore()
  const { notify } = useNotify()
  const requireAuth = useRequireAuth()
  const busy = ref(false)

  const myLike = computed(() =>
    recipe.value.likes.find((like) => like.userId === auth.userId),
  )
  const liked = computed(() => auth.isAuthenticated && Boolean(myLike.value))
  const count = computed(() => recipe.value.likes.length)

  async function reload() {
    const { data } = await likesApi.find({ recipeId: recipe.value.id })
    recipe.value.likes = data
  }

  async function toggle() {
    if (!requireAuth() || busy.value) return
    busy.value = true
    try {
      if (myLike.value) {
        await likesApi.remove(myLike.value.id)
        recipe.value.likes = recipe.value.likes.filter(
          (like) => like.id !== myLike.value.id,
        )
      } else {
        const { data } = await likesApi.add({
          recipeId: recipe.value.id,
          userId: auth.userId,
        })
        recipe.value.likes = [...recipe.value.likes, data]
      }
    } catch (error) {
      notify(error.message)
      if ([404, 409].includes(error.status)) await reload()
    } finally {
      busy.value = false
    }
  }

  return { liked, count, busy, toggle }
}
