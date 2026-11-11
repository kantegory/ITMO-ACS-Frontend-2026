import { useRoute, useRouter } from 'vue-router'

import { useToast } from '@/composables/useToast'

// Единая обработка ошибок запросов: истёкшая сессия ведёт на вход,
// остальное показываем уведомлением
export function useApiError() {
  const router = useRouter()
  const route = useRoute()
  const { showToast } = useToast()

  function goToLogin() {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
  }

  function handleError(error) {
    const status = error.response?.status
    if (status === 401) return goToLogin()
    if (!error.response) return showToast('Сервер не отвечает. Запустите API командой npm run api.')
    const message = error.response.data
    showToast(typeof message === 'string' ? message : 'Не удалось выполнить запрос')
  }

  return { handleError, goToLogin }
}
