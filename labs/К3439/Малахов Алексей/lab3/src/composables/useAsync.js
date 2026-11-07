import { ref } from 'vue'

export function useAsync(loader) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  let current = 0

  async function run(...args) {
    const request = ++current
    loading.value = true
    error.value = null
    try {
      const result = await loader(...args)
      if (request === current) data.value = result
      return result
    } catch (err) {
      if (request === current) error.value = err
      return null
    } finally {
      if (request === current) loading.value = false
    }
  }

  return { data, loading, error, run }
}
