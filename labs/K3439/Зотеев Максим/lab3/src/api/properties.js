export default class PropertiesApi {
  constructor(client) {
    this.client = client
  }

  getAll(filters = {}) {
    const params = {}
    if (filters.type) params.type = filters.type
    if (filters.city) params.city = filters.city
    if (filters.priceMin !== '' && filters.priceMin !== null && filters.priceMin !== undefined) {
      params.price_gte = filters.priceMin
    }
    if (filters.priceMax !== '' && filters.priceMax !== null && filters.priceMax !== undefined) {
      params.price_lte = filters.priceMax
    }
    return this.client.get('/properties', { params }).then(({ data }) => data)
  }

  getById(id) {
    return this.client.get(`/properties/${encodeURIComponent(id)}`).then(({ data }) => data)
  }

  getByOwner(userId) {
    return this.client.get('/properties', { params: { userId } }).then(({ data }) => data)
  }

  create(payload) {
    return this.client.post('/properties', payload).then(({ data }) => data)
  }
}
