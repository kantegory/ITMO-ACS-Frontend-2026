import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import '@/assets/css/themes.css'
import '@/assets/css/styles.css'
import '@/assets/main.css'

;(function applyThemeEarly() {
  try {
    let t = localStorage.getItem('vice-theme')
    if (t !== 'sunset' && t !== 'night') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'night'
        : 'sunset'
    }
    document.documentElement.dataset.theme = t
  } catch {
    /* ignore */
  }
})()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
