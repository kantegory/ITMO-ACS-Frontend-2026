class LikesApi {
  constructor(instance) {
    this.API = instance
  }

  get = (params = {}) =>
    this.API.get('/likes', { params }).then((r) => r.data)

  add = (recipeId, userId) =>
    this.API
      .post('/600/likes', {
        recipeId: Number(recipeId),
        userId: Number(userId),
      })
      .then((r) => r.data)

  remove = (id) => this.API.delete(`/600/likes/${id}`).then((r) => r.data)
}

export default LikesApi
