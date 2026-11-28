import { ref } from 'vue'

// Управление статусными уведомлениями (успех / ошибка)
export function useNotice() {
  const notice = ref(null)

  function showSuccess(text) {
    notice.value = { text, type: 'success' }
  }

  function showError(text) {
    notice.value = { text, type: 'danger' }
  }

  function clearNotice() {
    notice.value = null
  }

  return {
    notice,
    showSuccess,
    showError,
    clearNotice,
  }
}
