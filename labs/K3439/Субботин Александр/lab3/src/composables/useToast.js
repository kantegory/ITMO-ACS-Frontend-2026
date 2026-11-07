import { readonly, ref } from 'vue'

// Всплывающие уведомления. Список общий: показать тост может любая страница,
// а рисует их один ToastContainer в App.vue
const toasts = ref([])
let nextId = 1

function closeToast(id) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

// Ошибка не прячется сама — её закрывают кнопкой
function showToast(message, variant = 'success') {
  const id = nextId++
  toasts.value.push({ id, message, variant })
  if (variant !== 'danger') setTimeout(() => closeToast(id), 6000)
}

export function useToast() {
  return { toasts: readonly(toasts), showToast, closeToast }
}
