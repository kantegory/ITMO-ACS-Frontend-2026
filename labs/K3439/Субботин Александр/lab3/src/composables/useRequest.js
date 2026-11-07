import { ref } from 'vue'

// Загрузка данных из API: результат, флаг загрузки и ошибка.
// Если запрос перезапустили (например, поменяли фильтры), ответ предыдущего уже не нужен —
// рисуем только ответ последнего вызова
export function useRequest(request, { initialData = null, immediate = true } = {}) {
  const data = ref(initialData)
  const loading = ref(false)
  const error = ref(null)
  let lastCall = 0

  async function run(...args) {
    const call = ++lastCall
    loading.value = true
    error.value = null
    try {
      const result = await request(...args)
      if (call === lastCall) data.value = result
    } catch (requestError) {
      if (call === lastCall) error.value = requestError
    } finally {
      if (call === lastCall) loading.value = false
    }
  }

  if (immediate) run()

  return { data, loading, error, run }
}
