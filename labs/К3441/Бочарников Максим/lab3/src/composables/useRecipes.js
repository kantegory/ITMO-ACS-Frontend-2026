import { computed, onScopeDispose, ref, watch } from 'vue'
import { recipesApi, authorsApi, likesApi, apiURL } from '@/api'
import { useAuthStore } from '@/stores/auth'

export function useRecipes() {
  const recipes = ref([])
  const allIngredients = ref([])
  const authors = ref([])
  const likedIds = ref(new Set())
  const loading = ref(false)
  const error = ref('')
  const apiDown = ref(false)

  const filters = ref({
    search: '',
    type: '',
    difficulty: '',
    ingredients: [],
  })

  const authorMap = computed(() => {
    const map = new Map()
    authors.value.forEach((a) => map.set(Number(a.id), a))
    return map
  })

  let recipesRequest = 0
  let filterTimer
  let lastQuery = recipeParamsKey(filters.value)

  function recipeParamsKey(value = filters.value) {
    return JSON.stringify({
      q: value.search.trim(),
      type: value.type,
      difficulty: value.difficulty,
      ingredients: value.ingredients,
    })
  }

  function recipeParams() {
    const { search, type, difficulty, ingredients } = filters.value
    const params = {}
    const q = search.trim()
    if (q) params.q = q
    if (type) params.type = type
    if (difficulty) params.difficulty = difficulty
    if (ingredients.length) params.ingredients = ingredients.join(',')
    return params
  }

  async function loadRecipes() {
    const id = ++recipesRequest
    const data = await recipesApi.getAll(recipeParams())
    if (id !== recipesRequest) return
    recipes.value = data
    error.value = ''
  }

  async function checkApi() {
    try {
      await fetch(`${apiURL}/recipes`)
      apiDown.value = false
      return true
    } catch {
      apiDown.value = true
      return false
    }
  }

  async function loadCatalog() {
    loading.value = true
    error.value = ''
    const ok = await checkApi()
    if (!ok) {
      loading.value = false
      return
    }

    try {
      const auth = useAuthStore()
      const [, a, ingredients] = await Promise.all([
        loadRecipes(),
        authorsApi.getAll(),
        recipesApi.getIngredients(),
      ])
      authors.value = a
      allIngredients.value = ingredients

      if (auth.isLoggedIn) {
        try {
          const likes = await likesApi.get({ userId: auth.user.id })
          likedIds.value = new Set(likes.map((l) => Number(l.recipeId)))
        } catch {
          likedIds.value = new Set()
        }
      } else {
        likedIds.value = new Set()
      }
    } catch (e) {
      error.value = e.message || 'Не удалось загрузить каталог'
    } finally {
      loading.value = false
    }
  }

  onScopeDispose(() => clearTimeout(filterTimer))

  watch(
    filters,
    () => {
      const key = recipeParamsKey()
      if (key === lastQuery) return
      lastQuery = key
      clearTimeout(filterTimer)
      filterTimer = setTimeout(() => {
        loadRecipes().catch((e) => {
          error.value = e.message || 'Не удалось применить фильтры'
        })
      }, 250)
    },
    { deep: true }
  )

  function resetFilters() {
    filters.value = {
      search: '',
      type: '',
      difficulty: '',
      ingredients: [],
    }
  }

  function toggleIngredient(ing) {
    const list = filters.value.ingredients
    if (list.includes(ing)) {
      filters.value.ingredients = list.filter((i) => i !== ing)
    } else {
      filters.value.ingredients = [...list, ing]
    }
  }

  function getAuthor(id) {
    return authorMap.value.get(Number(id)) || { name: 'Автор', avatar: '' }
  }

  function setLiked(recipeId, liked) {
    const next = new Set(likedIds.value)
    if (liked) next.add(Number(recipeId))
    else next.delete(Number(recipeId))
    likedIds.value = next
  }

  function updateRecipeLikes(recipeId, likes) {
    const idx = recipes.value.findIndex((r) => Number(r.id) === Number(recipeId))
    if (idx >= 0) {
      recipes.value[idx] = { ...recipes.value[idx], likes }
    }
  }

  return {
    recipes,
    authors,
    likedIds,
    loading,
    error,
    apiDown,
    filters,
    filteredRecipes: recipes,
    allIngredients,
    loadCatalog,
    resetFilters,
    toggleIngredient,
    getAuthor,
    setLiked,
    updateRecipeLikes,
  }
}
