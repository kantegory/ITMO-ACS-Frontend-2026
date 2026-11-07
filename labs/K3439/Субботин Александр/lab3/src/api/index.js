// Корневой модуль API: здесь решаем, с каким instance работает каждый класс
import instance from '@/api/instance'
import AuthApi from '@/api/auth'
import BookingsApi from '@/api/bookings'
import DictionariesApi from '@/api/dictionaries'
import FavoritesApi from '@/api/favorites'
import RestaurantsApi from '@/api/restaurants'
import ReviewsApi from '@/api/reviews'
import UsersApi from '@/api/users'

const authApi = new AuthApi(instance)
const bookingsApi = new BookingsApi(instance)
const dictionariesApi = new DictionariesApi(instance)
const favoritesApi = new FavoritesApi(instance)
const restaurantsApi = new RestaurantsApi(instance)
const reviewsApi = new ReviewsApi(instance)
const usersApi = new UsersApi(instance)

export { authApi, bookingsApi, dictionariesApi, favoritesApi, restaurantsApi, reviewsApi, usersApi }
