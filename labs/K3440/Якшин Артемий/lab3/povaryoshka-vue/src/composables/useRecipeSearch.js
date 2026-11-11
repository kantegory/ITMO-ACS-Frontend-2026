import { reactive, ref, watch } from 'vue'

import { recipesApi } from '@/api'

// Поиск рецептов с фильтрами. Тип, сложность, время и текст фильтрует json-server,
// а условие «есть все выбранные ингредиенты» проверяем на клиенте
export function useRecipeSearch(initial = {}) {
  const filters = reactive({
    q: '',
    type: [],
    difficulty: [],
    tags: [],
    time: '',
    sort: 'likes',
    ...initial
  })

  const recipes = ref([])
  const loading = ref(false)
  const error = ref(null)
  let lastRequest = 0
  let searchTimer

  function buildParams() {
    const params = {
      type: filters.type,
      difficulty: filters.difficulty,
      time_lte: filters.time || undefined,
      q: filters.q.trim() || undefined
    }
    if (filters.sort === 'date') Object.assign(params, { _sort: 'createdAt', _order: 'desc' })
    if (filters.sort === 'time') Object.assign(params, { _sort: 'time', _order: 'asc' })
    return params
  }

  async function search() {
    const requestId = ++lastRequest
    loading.value = true
    error.value = null

    try {
      const { data } = await recipesApi.getAll(buildParams())
      // пока ждали ответ, фильтры могли поменяться: устаревший ответ не показываем
      if (requestId !== lastRequest) return

      let result = data.filter((recipe) => filters.tags.every((tag) => recipe.tags.includes(tag)))
      if (filters.sort === 'likes') result = result.toSorted((a, b) => b.likes.length - a.likes.length)
      recipes.value = result
    } catch (err) {
      if (requestId === lastRequest) error.value = err
    } finally {
      if (requestId === lastRequest) loading.value = false
    }
  }

  function reset() {
    Object.assign(filters, { q: '', type: [], difficulty: [], tags: [], time: '' })
  }

  // текст ищем с паузой 300 мс, остальные фильтры — сразу
  watch(() => filters.q, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(search, 300)
  })
  watch(() => [filters.type, filters.difficulty, filters.tags, filters.time, filters.sort], search, { deep: true })

  return { filters, recipes, loading, error, search, reset }
}
