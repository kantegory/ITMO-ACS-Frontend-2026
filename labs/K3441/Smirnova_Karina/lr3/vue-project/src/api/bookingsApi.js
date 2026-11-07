import http from '@/api/http.js'

// Получение всех бронирований
export async function getBookings() {
    const response = await http.get('/bookings', {
        params: {
            _expand: 'listing',
        }
    })
    return response.data
}

// Создание нового бронирования
export async function createBooking(bookingData) {
    const response = await http.post('/bookings', bookingData)
    return response.data
}

// Обновление существующего бронирования
export async function updateBooking(id, bookingData) {
    const response = await http.patch(`/bookings/${id}`, bookingData)
    return response.data
}
