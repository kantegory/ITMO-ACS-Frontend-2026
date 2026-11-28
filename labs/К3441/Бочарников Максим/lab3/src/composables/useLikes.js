import { useRouter } from 'vue-router'
import { likesApi, recipesApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

export function formatLikes(n) {
  return Number(n || 0).toLocaleString('ru-RU')
}

export function useLikes() {
  const auth = useAuthStore()
  const router = useRouter()

  async function toggleLike(recipeId, currentLikes, onChange) {
    if (!auth.isLoggedIn) {
      router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
      return null
    }

    const userId = auth.user.id
    let likes = Number(currentLikes || 0)

    try {
      const existing = (await likesApi.get({ recipeId, userId })).filter(Boolean)
      let liked
      if (existing.length) {
        // json-server после DELETE оставляет null в массиве — удаляем по валидному id
        const row = existing.find((l) => l && l.id != null)
        if (!row) throw new Error('Лайк повреждён в API, перезапусти npm run api')
        await likesApi.remove(row.id)
        likes = Math.max(0, likes - 1)
        liked = false
      } else {
        await likesApi.add(recipeId, userId)
        likes += 1
        liked = true
      }
      await recipesApi.patchLikes(recipeId, likes)
      onChange?.({ liked, likes })
      return { liked, likes }
    } catch (e) {
      alert(e.message || 'Не удалось обновить лайк')
      return null
    }
  }

  return { toggleLike, formatLikes }
}
