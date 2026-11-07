import { ownList } from '@/api/instance'

class FavoritesApi {
  constructor(instance) {
    this.API = instance
  }

  // restaurantId — чтобы на странице ресторана узнать, в избранном ли он
  getByUser = (userId, { restaurantId } = {}) => ownList(async () => {
    const response = await this.API.get('/favorites', {
      params: { userId, restaurantId, _expand: 'restaurant' },
    })
    return response.data
  })

  add = async (userId, restaurantId) => {
    const response = await this.API.post('/favorites', { userId, restaurantId })
    return response.data
  }

  remove = async (id) => {
    await this.API.delete(`/favorites/${id}`)
  }
}

export default FavoritesApi
