class AuthApi {
  constructor(instance) {
    this.API = instance
  }

  login = async (email, password) => {
    return this.API({ method: 'POST', url: '/login', data: { email, password } })
  }

  register = async (user) => {
    return this.API({ method: 'POST', url: '/register', data: user })
  }
}

export default AuthApi
