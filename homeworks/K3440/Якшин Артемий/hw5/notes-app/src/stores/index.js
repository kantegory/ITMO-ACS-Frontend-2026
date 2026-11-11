import { persist } from 'pinia-persists'
import { createPinia } from 'pinia'

const pinia = createPinia()

// состояние хранилищ сохраняется в localStorage и не теряется при перезагрузке
pinia.use(persist())

export default pinia
