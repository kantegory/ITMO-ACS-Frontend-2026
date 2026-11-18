import { createPinia } from 'pinia'
import { persist } from 'pinia-persists'

const storage = {
  getItem(key) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Запись уже хранится в API. Браузер может запретить кэш или исчерпать квоту.
    }
  },
}

const pinia = createPinia()
pinia.use(persist({ prefix: 'hw5', storage }))

export default pinia
