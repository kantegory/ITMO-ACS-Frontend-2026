class AuthApi {
  constructor(instance) {
    this.API = instance
  }

  login = (email, password) =>
    this.API.post('/login', { email, password }).then((r) => r.data)

  register = (payload) => this.API.post('/register', payload).then((r) => r.data)
}

export default AuthApi
