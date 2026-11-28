class RecipesApi {
  constructor(instance) {
    this.API = instance
  }

  getAll = (params = {}) =>
    this.API.get('/recipes', { params }).then((r) => r.data)

  getIngredients = () => this.API.get('/ingredients').then((r) => r.data)

  getById = (id) => this.API.get(`/recipes/${id}`).then((r) => r.data)

  getByUser = (userId) =>
    this.API.get('/recipes', { params: { userId } }).then((r) => r.data)

  patchLikes = (id, likes) =>
    this.API.patch(`/recipes/${id}`, { likes }).then((r) => r.data)
}

export default RecipesApi
