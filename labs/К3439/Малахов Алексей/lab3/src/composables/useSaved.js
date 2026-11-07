import { ref, watch } from 'vue'

import { savedApi } from '@/api'
import useAuthStore from '@/stores/auth'
import { useNotify } from '@/composables/useNotify'
import { useRequireAuth } from '@/composables/useRequireAuth'

const saved = ref(new Map())
const pending = ref(new Set())
const loadedFor = ref(null)

export function useSaved() {
  const auth = useAuthStore()
  const { notify } = useNotify()
  const requireAuth = useRequireAuth()

  async function load(force = false) {
    if (!auth.isAuthenticated) {
      saved.value = new Map()
      loadedFor.value = null
      return
    }
    if (!force && loadedFor.value === auth.userId) return
    const { data } = await savedApi.find({ userId: auth.userId })
    saved.value = new Map(data.map((item) => [item.recipeId, item.id]))
    loadedFor.value = auth.userId
  }

  function isSaved(recipeId) {
    return saved.value.has(recipeId)
  }

  function isPending(recipeId) {
    return pending.value.has(recipeId)
  }

  async function toggle(recipeId) {
    if (!requireAuth() || isPending(recipeId)) return
    pending.value = new Set(pending.value).add(recipeId)
    const next = new Map(saved.value)
    try {
      if (next.has(recipeId)) {
        await savedApi.remove(next.get(recipeId))
        next.delete(recipeId)
      } else {
        const { data } = await savedApi.add({ recipeId, userId: auth.userId })
        next.set(recipeId, data.id)
      }
      saved.value = next
    } catch (error) {
      notify(error.message)
      if ([404, 409].includes(error.status)) await load(true)
    } finally {
      const rest = new Set(pending.value)
      rest.delete(recipeId)
      pending.value = rest
    }
  }

  watch(
    () => auth.userId,
    () => load(),
  )

  return { saved, load, isSaved, isPending, toggle }
}
