import axios from 'axios'

// Моковое API заметок поднимается json-server'ом: npm run api.
// Адрес можно переопределить переменной окружения VITE_API_URL
const apiURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const instance = axios.create({
  baseURL: apiURL,
})

export default instance
