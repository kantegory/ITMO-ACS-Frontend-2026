import { favoritesApi } from '@/api'
import { useAuth } from '@/composables/useAuth'
import { useRequest } from '@/composables/useRequest'

// Избранные рестораны пользователя: список в личном кабинете и кнопка «В избранное» на странице ресторана.
// restaurantId — загрузить только запись для одного ресторана
export function useFavorites({ restaurantId } = {}) {
  const { user, isLoggedIn } = useAuth()

  const { data: favorites, loading, error, run: load } = useRequest(
    async () => (isLoggedIn.value ? favoritesApi.getByUser(user.value.id, { restaurantId }) : []),
    { initialData: [] },
  )

  const findFavorite = (id) => favorites.value.find((favorite) => favorite.restaurantId === id)

  async function add(id) {
    const favorite = await favoritesApi.add(user.value.id, id)
    favorites.value.push(favorite)
  }

  async function remove(favorite) {
    await favoritesApi.remove(favorite.id)
    favorites.value = favorites.value.filter((item) => item.id !== favorite.id)
  }

  // Возвращает новое состояние: true — ресторан теперь в избранном
  async function toggle(id) {
    const favorite = findFavorite(id)
    if (favorite) {
      await remove(favorite)
      return false
    }
    await add(id)
    return true
  }

  return { favorites, loading, error, load, findFavorite, remove, toggle }
}
