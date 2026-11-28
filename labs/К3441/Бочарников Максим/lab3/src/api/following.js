class FollowingApi {
  constructor(instance) {
    this.API = instance
  }

  getByUser = (userId) =>
    this.API.get('/following', { params: { userId } }).then((r) => r.data)

  add = (authorId, userId) =>
    this.API
      .post('/600/following', {
        authorId: Number(authorId),
        userId: Number(userId),
      })
      .then((r) => r.data)

  remove = (id) => this.API.delete(`/600/following/${id}`).then((r) => r.data)
}

export default FollowingApi
