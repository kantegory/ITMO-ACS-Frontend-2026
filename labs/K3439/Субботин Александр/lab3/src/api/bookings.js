import { ownList } from '@/api/instance'

class BookingsApi {
  constructor(instance) {
    this.API = instance
  }

  // Список json-server-auth сам не фильтрует, поэтому userId передаём явно. Сортировку по нескольким
  // полям (_sort=date,time) его проверка доступа не переваривает (401), поэтому время досортировываем на клиенте
  getByUser = (userId) => ownList(async () => {
    const response = await this.API.get('/bookings', {
      params: { userId, _expand: 'restaurant', _sort: 'date', _order: 'desc' },
    })
    return response.data
  })

  create = async (data) => {
    const response = await this.API.post('/bookings', data)
    return response.data
  }

  cancel = async (id) => {
    const response = await this.API.patch(`/bookings/${id}`, { status: 'cancelled' })
    return response.data
  }
}

export default BookingsApi
