import { computed, ref } from 'vue'

import { followsApi } from '@/api'
import useAuthStore from '@/stores/auth'
import { useNotify } from '@/composables/useNotify'
import { useRequireAuth } from '@/composables/useRequireAuth'

export function useFollow(authorId) {
  const auth = useAuthStore()
  const { notify } = useNotify()
  const requireAuth = useRequireAuth()
  const follows = ref([])
  const busy = ref(false)

  const mine = computed(() =>
    follows.value.find((follow) => follow.userId === auth.userId),
  )
  const following = computed(() => auth.isAuthenticated && Boolean(mine.value))
  const followers = computed(() => follows.value.length)

  async function load() {
    const { data } = await followsApi.find({ authorId: authorId.value })
    follows.value = data
  }

  async function toggle() {
    if (!requireAuth() || busy.value) return
    busy.value = true
    try {
      if (mine.value) {
        await followsApi.remove(mine.value.id)
        follows.value = follows.value.filter((follow) => follow.id !== mine.value.id)
      } else {
        const { data } = await followsApi.add({
          userId: auth.userId,
          authorId: authorId.value,
        })
        follows.value = [...follows.value, data]
      }
    } catch (error) {
      notify(error.message)
      if ([404, 409].includes(error.status)) await load()
    } finally {
      busy.value = false
    }
  }

  return { following, followers, busy, load, toggle }
}
