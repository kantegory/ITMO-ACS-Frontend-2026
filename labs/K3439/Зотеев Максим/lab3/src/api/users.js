export default class UsersApi {
  constructor(client) {
    this.client = client
  }

  getById(id) {
    return this.client.get(`/users/${encodeURIComponent(id)}`).then(({ data }) => data)
  }

  update(id, fields) {
    return this.client.patch(`/users/${encodeURIComponent(id)}`, fields).then(({ data }) => data)
  }
}
