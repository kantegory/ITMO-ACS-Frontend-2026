import { createPinia } from 'pinia'
import { persist } from 'pinia-persists'

const pinia = createPinia()
pinia.use(persist({ prefix: 'hw5' }))

export default pinia
