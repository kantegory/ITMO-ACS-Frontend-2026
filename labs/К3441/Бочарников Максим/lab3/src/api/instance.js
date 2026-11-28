import axios from 'axios'

const apiURL = 'http://127.0.0.1:3000'

const instance = axios.create({
  baseURL: apiURL,
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const err = new Error(
      error.response?.data?.message || error.message || 'Ошибка API'
    )
    err.status = error.response?.status
    err.data = error.response?.data
    return Promise.reject(err)
  }
)

export default instance
export { apiURL }
