class ReviewsApi {
  constructor(instance) {
    this.API = instance
  }

  getByUser = async (userId) => {
    const response = await this.API.get('/reviews', { params: { userId } })
    return response.data
  }

  create = async (data) => {
    const response = await this.API.post('/reviews', data)
    return response.data
  }
}

export default ReviewsApi
