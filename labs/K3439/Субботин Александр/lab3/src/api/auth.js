// Вход и регистрация через json-server-auth: оба запроса сразу возвращают accessToken и пользователя
class AuthApi {
  constructor(instance) {
    this.API = instance
  }

  login = async (email, password) => {
    const response = await this.API.post('/login', { email, password })
    return response.data
  }

  // json-server-auth сам хеширует пароль
  register = async (data) => {
    const response = await this.API.post('/register', data)
    return response.data
  }
}

export default AuthApi
