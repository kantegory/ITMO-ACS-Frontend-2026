import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import './assets/main.css'

createApp(App).use(pinia).use(router).mount('#app')
