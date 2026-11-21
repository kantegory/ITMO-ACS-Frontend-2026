import { client } from './client.js'

const unwrap = promise => promise.then(response => response.data)

export const api = {
    login(body) {
        return unwrap(client.post('/login', body))
    },
    register(body) {
        return unwrap(client.post('/register', body))
    },
    getTrainings(filters = {}, signal) {
        const values = {
            type: filters.type,
            level: filters.level,
            minutes_lte: filters.maxMinutes,
            q: filters.search?.trim()
        }
        const params = Object.fromEntries(Object.entries(values).filter(([, value]) =>
            value !== '' && value !== undefined && value !== null
        ))
        return unwrap(client.get('/trainings', { params, signal }))
    },
    getTraining(id, signal) {
        return unwrap(client.get(`/trainings/${encodeURIComponent(id)}`, { signal }))
    },
    getArticles(category = '', signal) {
        return unwrap(client.get('/articles', {
            params: category ? { category } : {},
            signal
        }))
    },
    getArticle(id, signal) {
        return unwrap(client.get(`/articles/${encodeURIComponent(id)}`, { signal }))
    },
    getUser(id, signal) {
        return unwrap(client.get(`/users/${encodeURIComponent(id)}`, {
            requiresAuth: true,
            signal
        }))
    },
    updatePlan(id, planChange) {
        return unwrap(client.patch(`/users/${encodeURIComponent(id)}`, { planChange }, {
            requiresAuth: true
        }))
    }
}