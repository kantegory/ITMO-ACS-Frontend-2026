class RecipesApi {
  constructor(instance) {
    this.API = instance
  }

  getAll = async (params = {}) => {
    return this.API({ url: '/recipes', params: { _embed: 'likes', ...params } })
  }

  getOne = async (id) => {
    return this.API({
      url: `/recipes/${id}`,
      params: { _embed: ['likes', 'comments'] },
    })
  }

  create = async (data) => {
    return this.API({ method: 'POST', url: '/recipes', data })
  }

  remove = async (id) => {
    return this.API({ method: 'DELETE', url: `/recipes/${id}` })
  }
}

export default RecipesApi
