export default class AuthApi {
  constructor(client) {
    this.client = client
  }

  login(credentials) {
    return this.client.post('/login', credentials).then(({ data }) => data)
  }

  register(payload) {
    return this.client.post('/register', payload).then(({ data }) => data)
  }
}
