class UsersApi {
  constructor(instance) {
    this.API = instance
  }

  getAll = async (params = {}) => {
    return this.API({ url: '/users', params })
  }

  getById = async (id) => {
    return this.API({ url: `/users/${id}` })
  }

  update = async (id, data) => {
    return this.API({ method: 'PATCH', url: `/users/${id}`, data })
  }
}

export default UsersApi
