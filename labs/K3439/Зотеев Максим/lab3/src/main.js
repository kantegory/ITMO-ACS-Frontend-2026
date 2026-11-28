import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import './assets/styles/themes/light.css'
import './assets/styles/themes/dark.css'
import './assets/styles/main.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { setUnauthorizedHandler } from './api'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
setUnauthorizedHandler(() => {
  authStore.clearSession()
  if (router.currentRoute.value.name !== 'login') {
    router.replace({
      name: 'login',
      query: { next: router.currentRoute.value.fullPath },
    })
  }
})

app.mount('#app')
