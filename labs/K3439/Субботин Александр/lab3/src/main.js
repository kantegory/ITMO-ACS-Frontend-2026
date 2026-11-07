import { createApp } from 'vue'

import App from '@/App.vue'
import router from '@/router'
import { onUnauthorized } from '@/api/instance'
import { useAuth } from '@/composables/useAuth'
import { installTheme } from '@/composables/useTheme'

import 'bootstrap/dist/css/bootstrap.min.css'
// JS Bootstrap: выпадающие меню, сворачиваемая навигация и панель фильтров работают через data-атрибуты
import 'bootstrap'
import '@/assets/styles/style.css'
import '@/assets/styles/themes/light.css'

installTheme()

// Токен истёк — выходим и отправляем на вход, а после него возвращаем на ту же страницу
onUnauthorized(() => {
  const { logout } = useAuth()
  logout()
  const current = router.currentRoute.value
  if (current.name !== 'login') router.push({ name: 'login', query: { next: current.fullPath } })
})

const app = createApp(App)

app.use(router)

app.mount('#app')
