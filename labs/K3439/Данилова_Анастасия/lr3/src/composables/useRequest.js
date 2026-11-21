import { ref } from 'vue'
import { errorText } from '../api'

export function useRequest() {
  const pending = ref(false)
  const error = ref('')

  async function run(action) {
    if (pending.value) return
    pending.value = true
    error.value = ''
    try {
      return await action()
    } catch (cause) {
      error.value = errorText(cause)
    } finally {
      pending.value = false
    }
  }

  return { pending, error, run }
}
