import { computed, ref, toValue } from 'vue'

import { socialApi } from '@/api'
import { useApiError } from '@/composables/useApiError'
import { useToast } from '@/composables/useToast'
import useAuthStore from '@/stores/auth'

// Подписка на кулинара: используется на странице рецепта и на странице кулинара.
// authorId можно передать числом, ref или функцией-геттером
export function useFollow(authorId) {
  const auth = useAuthStore()
  const { handleError, goToLogin } = useApiError()
  const { showToast } = useToast()

  const followers = ref([])
  const myFollow = computed(() => followers.value.find((sub) => sub.userId === auth.user?.id))
  const isFollowing = computed(() => Boolean(myFollow.value))
  const isMe = computed(() => auth.isLoggedIn && auth.user.id === toValue(authorId))

  async function loadFollowers() {
    const { data } = await socialApi.getSubscriptions({ authorId: toValue(authorId) })
    followers.value = data
  }

  async function toggleFollow() {
    if (!auth.isLoggedIn) return goToLogin()

    try {
      if (myFollow.value) {
        await socialApi.unsubscribe(myFollow.value.id)
        followers.value = followers.value.filter((sub) => sub.id !== myFollow.value.id)
        showToast('Подписка отменена')
      } else {
        const { data } = await socialApi.subscribe(auth.user.id, toValue(authorId))
        followers.value.push(data)
        showToast('Вы подписались')
      }
    } catch (error) {
      handleError(error)
    }
  }

  return { followers, isFollowing, isMe, loadFollowers, toggleFollow }
}
