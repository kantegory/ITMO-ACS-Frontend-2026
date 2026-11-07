class UsersApi {
  constructor(instance) {
    this.API = instance
  }

  getById = async (id) => {
    const response = await this.API.get(`/users/${id}`)
    return response.data
  }

  update = async (id, data) => {
    const response = await this.API.patch(`/users/${id}`, data)
    return response.data
  }
}

export default UsersApi
