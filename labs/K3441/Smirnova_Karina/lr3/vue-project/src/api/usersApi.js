import http from '@/api/http.js'

// Получение пользователя
export async function updateUser(id, userData) {
    const response = await http.patch(`/users/${id}`, userData)
    return response.data
}