import { ref } from 'vue'
import { api } from '../api'

function storedUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

const user = ref(localStorage.getItem('token') ? storedUser() : null)

function signOut() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  user.value = null
}

async function authenticate(endpoint, fields) {
  const { data } = await api.post(endpoint, fields)
  localStorage.setItem('token', data.accessToken)
  localStorage.setItem('user', JSON.stringify(data.user))
  user.value = data.user
}

export function useAuth() {
  return { user, signOut, authenticate }
}
