class CommentsApi {
  constructor(instance) {
    this.API = instance
  }

  getByRecipe = (recipeId) =>
    this.API
      .get('/comments', {
        params: { recipeId, _sort: 'id', _order: 'desc' },
      })
      .then((r) => r.data)

  create = (payload) =>
    this.API.post('/600/comments', payload).then((r) => r.data)
}

export default CommentsApi
