import { ref } from 'vue'

// Всплывающие уведомления: общий список на всё приложение,
// показывает их компонент ToastHost
const toasts = ref([])
let nextId = 1

export function useToast() {
  function removeToast(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function showToast(message) {
    const id = nextId++
    toasts.value.push({ id, message })
    setTimeout(() => removeToast(id), 3000)
  }

  return { toasts, showToast, removeToast }
}
