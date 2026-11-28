import axios from 'axios';

const client = axios.create({ baseURL: '/api', timeout: 8000 });
const sessionKey = 'vector-lab3:token';

const authErrors = {
  'Email already exists': 'Аккаунт с такой почтой уже существует.',
  'Email format is invalid': 'Введите корректный адрес почты.',
  'Cannot find user': 'Проверьте почту и пароль.',
  'Incorrect password': 'Проверьте почту и пароль.',
  'Password is too short': 'Пароль должен содержать минимум 8 символов.'
};

export const getToken = () => localStorage.getItem(sessionKey);
export const clearToken = () => localStorage.removeItem(sessionKey);

async function request(url, { method = 'GET', data, useToken = false, signal } = {}) {
  const token = useToken && getToken();
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return (await client.request({ url, method, data, headers, signal })).data;
  } catch (cause) {
    if (axios.isCancel(cause)) throw cause;
    const status = cause.response?.status;
    if (status === 401 && token && token === getToken()) clearToken();
    const body = cause.response?.data;
    const message = status
      ? body?.message ?? authErrors[body] ?? 'Сервер не смог выполнить запрос.'
      : 'Сервер не ответил. Попробуйте ещё раз.';
    const error = new Error(message, { cause });
    error.status = status;
    throw error;
  }
}

async function authenticate(path, data) {
  const { accessToken, user } = await request(path, { method: 'POST', data });
  localStorage.setItem(sessionKey, accessToken);
  return user;
}

export const getUser = () => request('/me', { useToken: true });
export const register = data => authenticate('/register', data);
export const login = data => authenticate('/login', data);
export const listJobs = () => request('/jobs');
export const getJob = (id, signal) => request(`/jobs/${encodeURIComponent(id)}`, { signal });
export const ownJobs = () => request('/jobs?mine=1', { useToken: true });

export function saveJob(data, id) {
  return request(id ? `/jobs/${encodeURIComponent(id)}` : '/jobs', {
    method: id ? 'PATCH' : 'POST', data, useToken: true
  });
}

export function deleteJob(id) {
  return request(`/jobs/${encodeURIComponent(id)}`, { method: 'DELETE', useToken: true });
}

export async function getResume() {
  const [resume] = await request('/resumes', { useToken: true });
  return resume ?? null;
}

export function saveResume(data, id) {
  return request(id ? `/resumes/${encodeURIComponent(id)}` : '/resumes', {
    method: id ? 'PATCH' : 'POST', data, useToken: true
  });
}

export const listApplications = signal => request('/applications', { useToken: true, signal });

export function apply(jobId) {
  return request('/applications', { method: 'POST', data: { jobId }, useToken: true });
}

let ratesPromise;

export function exchangeRates() {
  ratesPromise ??= axios.get('https://open.er-api.com/v6/latest/RUB', { timeout: 5000 })
    .then(({ data }) => {
      if (data.result !== 'success' || !(data.rates?.USD > 0 && data.rates?.EUR > 0)) {
        throw new Error('Курс валют недоступен.');
      }
      return data.rates;
    })
    .catch(error => {
      ratesPromise = undefined;
      throw error;
    });
  return ratesPromise;
}
