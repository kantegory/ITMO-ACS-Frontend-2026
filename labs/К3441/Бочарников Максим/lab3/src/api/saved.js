class SavedApi {
  constructor(instance) {
    this.API = instance
  }

  getByUser = (userId) =>
    this.API.get('/saved', { params: { userId } }).then((r) => r.data)
}

export default SavedApi
