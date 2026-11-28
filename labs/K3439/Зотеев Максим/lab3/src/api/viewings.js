export default class ViewingsApi {
  constructor(client) {
    this.client = client
  }

  create(payload) {
    return this.client.post('/viewings', payload).then(({ data }) => data)
  }
}
