import axios from 'axios';
import { setSession, token } from './session.js';

const client = axios.create({ baseURL: '/api', timeout: 10000 });
const privateClient = axios.create({ baseURL: '/api', timeout: 10000 });

function explainError(error) {
  if (axios.isCancel(error)) throw error;
  const status = error.response?.status;
  const message = error.response?.data?.message ??
    (status ? 'Ошибка API. Попробуйте ещё раз.' : 'Не удалось связаться с API. Проверьте, запущен ли сервер.');
  throw Object.assign(new Error(message), { status });
}

client.interceptors.response.use(response => response.data, explainError);

privateClient.interceptors.request.use(config => {
  if (token.value) config.headers.set('Authorization', 'Bearer ' + token.value);
  return config;
});
privateClient.interceptors.response.use(
  response => response.data,
  error => {
    const authorization = error.config?.headers?.get('Authorization');
    if (error.response?.status === 401 && authorization === 'Bearer ' + token.value) setSession(null);
    return explainError(error);
  },
);

async function getEntry(collection, id) {
  try {
    return await client.get('/' + collection + '/' + encodeURIComponent(id));
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export const api = {
  workouts: () => client.get('/workouts'),
  workout: id => getEntry('workouts', id),
  articles: () => client.get('/articles'),
  article: id => getEntry('articles', id),
  authenticate: (mode, credentials) => client.post('/auth/' + mode, credentials),
  profile: () => privateClient.get('/me'),
  logout: () => privateClient.post('/auth/logout'),
  activity: () => privateClient.get('/activity'),
  addPlan: entry => privateClient.post('/activity/plan', entry),
  removePlan: id => privateClient.delete('/activity/plan/' + encodeURIComponent(id)),
  completePlan: id => privateClient.post('/activity/plan/' + encodeURIComponent(id) + '/complete'),
  completeWorkout: workout => privateClient.post('/activity/complete', { workout }),
};
