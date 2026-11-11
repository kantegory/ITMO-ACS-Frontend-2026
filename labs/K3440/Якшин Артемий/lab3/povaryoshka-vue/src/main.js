import { createApp } from 'vue'

import App from '@/App.vue'
import router from '@/router'
import store from '@/stores'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import '@/assets/styles/themes/light.css'
import '@/assets/styles/themes/dark.css'
import '@/assets/styles/main.css'

const app = createApp(App)

app.use(store)
app.use(router)

app.mount('#app')
