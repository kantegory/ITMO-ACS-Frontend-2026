import axios from 'axios'

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const instance = axios.create({
  baseURL: apiURL
})

export default instance
