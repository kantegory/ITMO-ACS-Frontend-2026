import { ref } from 'vue'

const message = ref('')
let timer

export function useNotify() {
  function notify(text) {
    message.value = text
    clearTimeout(timer)
    timer = setTimeout(() => (message.value = ''), 4000)
  }

  return { message, notify }
}
