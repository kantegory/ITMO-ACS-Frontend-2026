import { computed, onBeforeUnmount, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ratingOf } from '@/utils/format'

const SORTS = ['rating', 'reviews', 'price-asc', 'price-desc']
const RATINGS = [0, 4, 4.5]

const list = (value) => [value ?? []].flat().filter(Boolean).map(String)

// Фильтры поиска живут в адресной строке (?cuisine=italian&price=2) — ссылкой на поиск можно поделиться,
// а «Назад» в браузере возвращает предыдущие фильтры
export function filtersFromQuery(query) {
  const rating = Number(query.rating)
  return {
    q: typeof query.q === 'string' ? query.q : '',
    cuisines: list(query.cuisine),
    district: typeof query.district === 'string' ? query.district : '',
    prices: list(query.price),
    rating: RATINGS.includes(rating) ? rating : 0,
    features: list(query.feature),
    sort: SORTS.includes(query.sort) ? query.sort : 'rating',
  }
}

export function filtersToQuery(filters) {
  const query = {}
  if (filters.q.trim()) query.q = filters.q.trim()
  if (filters.cuisines.length) query.cuisine = [...filters.cuisines]
  if (filters.district) query.district = filters.district
  if (filters.prices.length) query.price = [...filters.prices]
  if (filters.rating) query.rating = String(filters.rating)
  if (filters.features.length) query.feature = [...filters.features]
  if (filters.sort !== 'rating') query.sort = filters.sort
  return query
}

const sameQuery = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// Кухню, район, ценовой уровень, текстовый поиск и сортировку по цене делает json-server (query-параметры)
export function serverParams(filters) {
  const params = {}
  if (filters.q.trim()) params.q = filters.q.trim()
  if (filters.cuisines.length) params.cuisineId = filters.cuisines
  if (filters.district) params.districtId = filters.district
  if (filters.prices.length) params.priceLevel = filters.prices
  if (filters.sort === 'price-asc' || filters.sort === 'price-desc') {
    params._sort = 'avgCheck'
    params._order = filters.sort === 'price-asc' ? 'asc' : 'desc'
  }
  return params
}

// Рейтинг считается по отзывам, поэтому фильтр/сортировка по рейтингу и особенности — на клиенте
export function applyClientFilters(restaurants, filters) {
  const result = restaurants
    .map((restaurant) => ({ ...restaurant, rating: ratingOf(restaurant.reviews) }))
    .filter((restaurant) => restaurant.rating.value >= filters.rating)
    .filter((restaurant) => filters.features.every((feature) => restaurant.features.includes(feature)))

  if (filters.sort === 'rating') result.sort((a, b) => b.rating.value - a.rating.value)
  if (filters.sort === 'reviews') result.sort((a, b) => b.rating.count - a.rating.count)
  return result
}

// Состояние формы фильтров, связанное с адресной строкой в обе стороны:
// форма → URL (router.replace), URL → форма (ссылки «Рестораны», плитки кухонь, «Назад»)
export function useRestaurantFilters() {
  const route = useRoute()
  const router = useRouter()

  const filters = reactive(filtersFromQuery(route.query))
  const applied = computed(() => filtersFromQuery(route.query))

  watch(() => route.query, (query) => {
    const fromUrl = filtersFromQuery(query)
    if (!sameQuery(filtersToQuery(fromUrl), filtersToQuery(filters))) Object.assign(filters, fromUrl)
  })

  // Текстовый поиск ждёт, пока пользователь допечатает, остальные фильтры применяются сразу
  let timer
  watch(() => filtersToQuery(filters), (query, oldQuery) => {
    clearTimeout(timer)
    if (sameQuery(query, filtersToQuery(applied.value))) return
    const delay = query.q !== oldQuery.q ? 350 : 0
    timer = setTimeout(() => router.replace({ query }), delay)
  })
  onBeforeUnmount(() => clearTimeout(timer))

  const activeCount = computed(() => filters.cuisines.length + filters.prices.length + filters.features.length
    + (filters.district ? 1 : 0) + (filters.rating ? 1 : 0))

  function resetFilters() {
    Object.assign(filters, filtersFromQuery({}))
  }

  return { filters, applied, activeCount, resetFilters }
}
