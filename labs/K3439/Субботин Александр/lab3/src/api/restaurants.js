// Рестораны вместе с кухней и районом (_expand) и отзывами (_embed) — по ним считается рейтинг
const CARD_PARAMS = { _expand: ['cuisine', 'district'], _embed: 'reviews' }
const PAGE_PARAMS = { _expand: ['cuisine', 'district'], _embed: ['menu', 'reviews'] }

class RestaurantsApi {
  constructor(instance) {
    this.API = instance
  }

  // params — фильтры json-server: q, cuisineId, districtId, priceLevel, _sort, _order
  getAll = async (params = {}) => {
    const response = await this.API.get('/restaurants', { params: { ...CARD_PARAMS, ...params } })
    return response.data
  }

  getById = async (id) => {
    const response = await this.API.get(`/restaurants/${id}`, { params: PAGE_PARAMS })
    return response.data
  }
}

export default RestaurantsApi
