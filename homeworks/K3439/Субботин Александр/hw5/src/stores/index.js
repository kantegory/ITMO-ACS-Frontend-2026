import { persist } from 'pinia-persists'
import { createPinia } from 'pinia'

const pinia = createPinia()

// стейт всех хранилищ сохраняется в localStorage и не сбрасывается при перезагрузке
pinia.use(persist())

export default pinia
