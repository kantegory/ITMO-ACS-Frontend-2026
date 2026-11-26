import axios from 'axios';
import { createService } from '@lab2/remote-service.js';

const client = axios.create({ baseURL: '/api', timeout: 6000 });

export const api = createService(async (method, url, { token, body } = {}) => {
  try {
    const response = await client.request({
      method, url, data: body,
      headers: token ? { Authorization: 'Bearer ' + token } : undefined,
    });
    return response.data;
  } catch (error) {
    const response = error.response;
    throw Object.assign(new Error(response?.data?.message ??
      (response?.status === 404 ? 'Ресурс не найден.' : 'Сервер недоступен или запрос не выполнен.')), { status: response?.status });
  }
});
