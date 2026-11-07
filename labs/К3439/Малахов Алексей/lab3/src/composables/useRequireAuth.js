import { useRoute, useRouter } from 'vue-router'

import useAuthStore from '@/stores/auth'

export function useRequireAuth() {
  const auth = useAuthStore()
  const route = useRoute()
  const router = useRouter()

  return function requireAuth() {
    if (auth.isAuthenticated) return true
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return false
  }
}
