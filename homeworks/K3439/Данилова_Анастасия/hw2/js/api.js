const API_URL = 'http://localhost:3000'

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) {
    headers.Authorization = 'Bearer ' + token
  }

  const res = await fetch(API_URL + path, { ...options, headers })

  if (res.status === 401 && token) {
    logout()
    return
  }

  const data = await res.json()
  if (!res.ok) {
    // json-server-auth возвращает ошибку просто строкой
    throw new Error(typeof data === 'string' ? data : 'Ошибка ' + res.status)
  }
  return data
}
