import { createApi } from './app.js'

const port = Number(process.env.API_PORT || 3000)
const server = createApi().listen(port, '127.0.0.1', () => console.log(`Recipe API: http://127.0.0.1:${port}/api`))
server.on('error', (error) => { console.error(error.message); process.exitCode = 1 })
