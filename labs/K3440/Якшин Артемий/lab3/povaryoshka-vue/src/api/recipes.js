class RecipesApi {
  constructor(instance) {
    this.API = instance
  }

  // список с автором и лайками; params — фильтры json-server (type, difficulty, q, _sort…)
  getAll = async (params = {}) => {
    return this.API({
      url: '/recipes',
      params: { _expand: 'user', _embed: 'likes', ...params }
    })
  }

  getById = async (id) => {
    return this.API({ url: `/recipes/${id}`, params: { _expand: 'user' } })
  }

  create = async (data) => {
    return this.API({ method: 'POST', url: '/recipes', data })
  }

  update = async (id, data) => {
    return this.API({ method: 'PATCH', url: `/recipes/${id}`, data })
  }

  remove = async (id) => {
    return this.API({ method: 'DELETE', url: `/recipes/${id}` })
  }
}

export default RecipesApi
