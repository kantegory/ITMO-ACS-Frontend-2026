import { createService } from './remote-service.js';

export const service = createService(async (method, path, { token, body } = {}) => {
  let response;
  try {
    response = await fetch('/api' + path, {
      method,
      headers: {
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Сервер недоступен. Попробуйте ещё раз.');
  }
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.message ?? 'Не удалось выполнить запрос.'), { status: response.status });
  return data;
});
