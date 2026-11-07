import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginUser } from '@/api/authApi'

// Чтение значения
function readStoredUser() {
    const savedUser = localStorage.getItem('currentUser')

    if (!savedUser) {
        return null
    }

    try {
        return JSON.parse(savedUser)
    } catch {
        localStorage.removeItem('currentUser')
        return null
    }
}

// Возвращает копию данных пользователя без пароля.
function createSafeUser(userData) {
    if (!userData) {
        return null
    }

    const safeUser = { ...userData }
    delete safeUser.password
    return safeUser
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref(readStoredUser())
    const token = ref(localStorage.getItem('accessToken'))

    const isAuthenticated = computed(() => {
        return Boolean(user.value && token.value)
    })

    async function login(credentials) {
        const result = await loginUser(credentials)

        token.value = result.accessToken
        user.value = createSafeUser(result.user)

        localStorage.setItem('accessToken', token.value)
        localStorage.setItem('currentUser', JSON.stringify(user.value))

        return user.value
    }

    function updateCurrentUser(userData) {
        const updateUser = createSafeUser({
            ...user.value,
            ...userData
        })
        user.value = updateUser
        localStorage.setItem('currentUser', JSON.stringify(user.value))
    }

    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('currentUser')
    }

    return {
        user,
        token,
        isAuthenticated,
        login,
        updateCurrentUser,
        logout
    }
})
