import { api } from '../api/index.js'
import {
    session,
    currentUser,
    isAuthenticated,
    saveSession,
    clearSession
} from '../state/session.js'

export function useAuth() {
    async function authenticate(mode, body) {
        const result = mode === 'register'
            ? await api.register(body)
            : await api.login(body)
        saveSession(result)
    }

    async function refreshUser(signal) {
        if (!session.value) throw new Error('Сначала войди в аккаунт.')
        const user = await api.getUser(session.value.userId, signal)
        currentUser.value = user
        return user
    }

    return {
        user: currentUser,
        isAuthenticated,
        authenticate,
        refreshUser,
        logout: clearSession
    }
}