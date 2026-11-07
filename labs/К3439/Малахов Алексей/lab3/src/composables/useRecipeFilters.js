import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { recipesApi } from '@/api'
import { useAsync } from '@/composables/useAsync'
import { DIFFICULTIES, DISH_TYPES, INGREDIENTS, escapeRegExp } from '@/utils/recipes'

const SORTS = {
  popular: (a, b) => b.likes.length - a.likes.length,
  fast: (a, b) => a.time - b.time,
  title: (a, b) => a.title.localeCompare(b.title, 'ru'),
}

const TIMES = ['30', '60', '120']

const pick = (value, allowed) => (allowed.includes(value) ? value : '')
const pickMany = (value, allowed) =>
  [].concat(value ?? []).filter((item) => allowed.includes(item))

function fromQuery(query) {
  return {
    q: typeof query.q === 'string' ? query.q : '',
    type: pick(query.type, DISH_TYPES),
    difficulty: pickMany(query.difficulty, DIFFICULTIES),
    ingredients: pickMany(query.ingredients, INGREDIENTS),
    time: pick(query.time, TIMES),
    sort: pick(query.sort, Object.keys(SORTS)) || 'popular',
  }
}

function toQuery(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([key, value]) => {
      if (key === 'sort') return value !== 'popular'
      return Array.isArray(value) ? value.length : value
    }),
  )
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

export function useRecipeFilters() {
  const route = useRoute()
  const router = useRouter()
  const filters = reactive(fromQuery(route.query))

  const { data, loading, error, run } = useAsync(async () => {
    const { data } = await recipesApi.getAll({
      title_like: escapeRegExp(filters.q.trim()) || undefined,
      type: filters.type || undefined,
      difficulty: filters.difficulty,
      time_lte: filters.time || undefined,
    })
    return data
  })

  const results = computed(() =>
    (data.value || [])
      .filter((recipe) =>
        filters.ingredients.every((item) => recipe.tags.includes(item)),
      )
      .sort(SORTS[filters.sort]),
  )

  function reset() {
    Object.assign(filters, fromQuery({}))
  }

  let timer
  watch(
    () => toQuery(filters),
    (query) => {
      if (!same(query, toQuery(fromQuery(route.query)))) router.replace({ query })
      clearTimeout(timer)
      timer = setTimeout(run, 300)
    },
    { deep: true },
  )

  watch(
    () => route.query,
    (query) => {
      const next = fromQuery(query)
      if (!same(toQuery(next), toQuery(filters))) Object.assign(filters, next)
    },
  )

  if (!same(toQuery(filters), route.query)) router.replace({ query: toQuery(filters) })
  run()

  return { filters, results, loading, error, reset, reload: run }
}
