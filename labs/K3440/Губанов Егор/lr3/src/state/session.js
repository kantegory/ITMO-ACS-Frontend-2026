import { computed, ref } from 'vue'

const STORAGE_KEY = 'vmeste-lr3-session'

function readSession() {
    try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY))
        return typeof value?.accessToken === 'string' && value.accessToken &&
        Number.isInteger(value.userId) && value.userId > 0
            ? value
            : null
    } catch {
        return null
    }
}

export const session = ref(readSession())
export const currentUser = ref(null)
export const isAuthenticated = computed(() => Boolean(session.value))

export function saveSession(result) {
    const value = {
        accessToken: result.accessToken,
        userId: result.user.id
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
        throw new Error('Разреши локальное хранилище браузера и войди снова.')
    }
    session.value = value
    currentUser.value = result.user
}

export function clearSession() {
    session.value = null
    currentUser.value = null
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {}
}