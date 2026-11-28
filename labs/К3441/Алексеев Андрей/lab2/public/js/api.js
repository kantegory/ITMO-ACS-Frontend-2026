const sessionKey = 'vector-lab2:token';
const ratesEndpoint = 'https://open.er-api.com/v6/latest/RUB';
let ratesPromise;

const authErrors = {
  'Email already exists': 'Аккаунт с такой почтой уже существует.',
  'Email format is invalid': 'Введите корректный адрес почты.',
  'Cannot find user': 'Проверьте почту и пароль.',
  'Incorrect password': 'Проверьте почту и пароль.',
  'Password is too short': 'Пароль должен содержать минимум 8 символов.'
};

async function request(path, { method = 'GET', body, authenticated = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem(sessionKey);
  if (authenticated && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`/api${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8000)
    });
  } catch {
    throw new Error('Сервер не ответил. Попробуйте ещё раз.');
  }
  const payload = await response.json().catch(() => null);
  if (response.status === 401 && authenticated && token === localStorage.getItem(sessionKey)) logout();
  if (!response.ok) {
    const message = payload?.message ?? authErrors[payload];
    const error = new Error(message || 'Сервер не смог выполнить запрос.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function currentUser() {
  if (!localStorage.getItem(sessionKey)) return null;
  try {
    return await request('/me', { authenticated: true });
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export function logout() {
  localStorage.removeItem(sessionKey);
}

async function authenticate(path, data) {
  const { accessToken, user } = await request(path, { method: 'POST', body: data });
  localStorage.setItem(sessionKey, accessToken);
  return user;
}

export const register = data => authenticate('/register', data);
export const login = data => authenticate('/login', data);
export const listJobs = () => request('/jobs');
export const getJob = id => request(`/jobs/${encodeURIComponent(id)}`);
export const ownJobs = () => request('/jobs?mine=1', { authenticated: true });

export function saveJob(data, id) {
  return request(id ? `/jobs/${encodeURIComponent(id)}` : '/jobs', {
    method: id ? 'PATCH' : 'POST', body: data, authenticated: true
  });
}

export function deleteJob(id) {
  return request(`/jobs/${encodeURIComponent(id)}`, { method: 'DELETE', authenticated: true });
}

export async function getResume() {
  const [resume] = await request('/resumes', { authenticated: true });
  return resume ?? null;
}

export async function saveResume(data, id) {
  return request(id ? `/resumes/${encodeURIComponent(id)}` : '/resumes', {
    method: id ? 'PATCH' : 'POST', body: data, authenticated: true
  });
}

export const listApplications = () => request('/applications', { authenticated: true });

export function apply(job) {
  return request('/applications', { method: 'POST', body: { jobId: job.id }, authenticated: true });
}

export function exchangeRates() {
  ratesPromise ??= fetch(ratesEndpoint, { signal: AbortSignal.timeout(5000) })
    .then(async response => {
      if (!response.ok) throw new Error('Курс валют недоступен.');
      const data = await response.json();
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
