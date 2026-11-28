class AuthorsApi {
  constructor(instance) {
    this.API = instance
  }

  getAll = () => this.API.get('/authors').then((r) => r.data)

  getById = (id) => this.API.get(`/authors/${id}`).then((r) => r.data)
}

export default AuthorsApi
