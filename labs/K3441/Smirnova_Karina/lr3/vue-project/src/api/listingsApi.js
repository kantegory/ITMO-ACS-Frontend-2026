import http from '@/api/http.js'

// Получение всех объявлений с учетом фильтров
export async function getListings(filters = {}) {
    const params = {
        active: true,
        mode: filters.mode || undefined,
        type: filters.type || undefined,
        location_like: filters.location || undefined,
        price_gte: filters.min || undefined,
        price_lte: filters.max || undefined,
    }

    if (filters.sort === 'price-asc') {
        params._sort = 'price';
        params._order = 'asc';
    }

    if (filters.sort === 'price-desc') {
        params._sort = 'price';
        params._order = 'desc';
    }
    const response = await http.get('/listings', { params })
    return response.data
}

// Получение объявления по ID
export async function getListing(id) {
    const response = await http.get(`/listings/${id}`)
    return response.data
}

// Получение объявлений пользователя
export async function getUserListings(userId) {
    const response = await http.get(`/listings`, {
        params: {
            userId: userId,
        }
    });
    return response.data;
}

// Обновление объявления по ID
export async function updateListing(id, updatedData) {
    const response = await http.patch(`/listings/${id}`, updatedData);
    return response.data;
}
