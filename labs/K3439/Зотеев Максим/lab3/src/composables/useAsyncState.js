import { ref } from 'vue'

// Управление состоянием загрузки и ошибок асинхронных запросов
export function useAsyncState(initialLoading = false) {
  const loading = ref(initialLoading)
  const error = ref('')
  let activeRequestId = 0

  function clearError() {
    error.value = ''
  }

  async function run(asyncFn, { mapError } = {}) {
    const requestId = ++activeRequestId
    loading.value = true
    error.value = ''

    try {
      return await asyncFn()
    } catch (requestError) {
      if (requestId === activeRequestId) {
        error.value = mapError
          ? mapError(requestError)
          : requestError.message || 'Не удалось выполнить запрос.'
      }
      throw requestError
    } finally {
      if (requestId === activeRequestId) {
        loading.value = false
      }
    }
  }

  return {
    loading,
    error,
    clearError,
    run,
  }
}
