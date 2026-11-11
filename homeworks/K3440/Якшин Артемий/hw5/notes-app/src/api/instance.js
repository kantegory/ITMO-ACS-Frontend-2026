import axios from 'axios'

const apiURL = 'http://localhost:3000'

// один общий экземпляр axios на всё приложение:
// базовый адрес и обработку ошибок можно настроить в одном месте
const instance = axios.create({
  baseURL: apiURL
})

export default instance
