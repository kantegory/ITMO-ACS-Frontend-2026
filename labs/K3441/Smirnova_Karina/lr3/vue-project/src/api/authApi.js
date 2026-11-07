import http from '@/api/http'

// Запрос регистрации пользователя
export async function registerUser(userData) {
    const response = await http.post('/register', userData)
    return response.data
}

// Запрос входа пользователя
export async function loginUser(credentials) {
    const response = await http.post('/login', credentials)
    return response.data
}