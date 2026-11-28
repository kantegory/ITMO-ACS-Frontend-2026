import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()
  const { user, accessToken, isLoggedIn } = storeToRefs(store)

  function requireAuth(redirectTo = '/login') {
    if (!store.isLoggedIn) {
      router.push({ path: redirectTo, query: { redirect: router.currentRoute.value.fullPath } })
      return false
    }
    return true
  }

  function logoutAndGoHome() {
    store.logout()
    router.push('/')
  }

  return {
    user,
    accessToken,
    isLoggedIn,
    login: store.login,
    register: store.register,
    logout: store.logout,
    requireAuth,
    logoutAndGoHome,
  }
}
