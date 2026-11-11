import { ref } from 'vue'

import { socialApi } from '@/api'
import { useApiError } from '@/composables/useApiError'
import { useToast } from '@/composables/useToast'
import useAuthStore from '@/stores/auth'

// Сохранённые рецепты текущего пользователя: нужны на главной,
// на странице рецепта, у кулинара и в личном кабинете
export function useSaved() {
  const auth = useAuthStore()
  const { handleError, goToLogin } = useApiError()
  const { showToast } = useToast()

  // recipeId -> id записи в /saves
  const saved = ref(new Map())

  async function loadSaved() {
    if (!auth.isLoggedIn) {
      saved.value = new Map()
      return
    }
    try {
      const { data } = await socialApi.getSaves(auth.user.id)
      saved.value = new Map(data.map((save) => [save.recipeId, save.id]))
    } catch {
      saved.value = new Map()
    }
  }

  function isSaved(recipeId) {
    return saved.value.has(recipeId)
  }

  async function toggleSave(recipeId) {
    if (!auth.isLoggedIn) return goToLogin()

    try {
      if (isSaved(recipeId)) {
        await socialApi.removeSave(saved.value.get(recipeId))
        saved.value.delete(recipeId)
        showToast('Рецепт убран из сохранённых')
      } else {
        const { data } = await socialApi.addSave(auth.user.id, recipeId)
        saved.value.set(recipeId, data.id)
        showToast('Рецепт сохранён')
      }
    } catch (error) {
      handleError(error)
    }
  }

  return { saved, isSaved, loadSaved, toggleSave }
}
