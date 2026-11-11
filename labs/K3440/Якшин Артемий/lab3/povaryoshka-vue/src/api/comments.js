class CommentsApi {
  constructor(instance) {
    this.API = instance
  }

  getByRecipe = async (recipeId) => {
    return this.API({
      url: '/comments',
      params: { recipeId, _expand: 'user', _sort: 'createdAt', _order: 'desc' }
    })
  }

  create = async (data) => {
    return this.API({ method: 'POST', url: '/comments', data })
  }

  remove = async (id) => {
    return this.API({ method: 'DELETE', url: `/comments/${id}` })
  }
}

export default CommentsApi
