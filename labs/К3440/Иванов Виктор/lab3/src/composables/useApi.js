import axios from 'axios';
import { useAuth } from './useAuth';
const api = axios.create({ baseURL: 'http://localhost:3001', timeout: 10000 });
api.interceptors.request.use(config => {
  const token = useAuth().token();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export function useApi() {
  const message = error => error.response?.data?.error || error.message || 'Неизвестная ошибка';
  return { api, message };
}
