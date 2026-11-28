const sessionKey = 'kachalochka-lab2:token';

async function request(path, { method = 'GET', body, authenticated = false } = {}) {
  const headers = new Headers();
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  const token = authenticated ? sessionStorage.getItem(sessionKey) : null;
  if (token) headers.set('Authorization', 'Bearer ' + token);

  let response;
  try {
    response = await fetch('/api' + path, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('Не удалось связаться с API. Проверьте, запущен ли сервер.');
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) {
    if (response.status === 401 && authenticated) sessionStorage.removeItem(sessionKey);
    const error = new Error(data?.message || 'Ошибка API. Попробуйте ещё раз.');
    error.status = response.status;
    throw error;
  }
  return data;
}

async function authenticate(mode, credentials) {
  const result = await request('/auth/' + mode, { method: 'POST', body: credentials });
  sessionStorage.setItem(sessionKey, result.token);
}

export async function getProfile() {
  if (!sessionStorage.getItem(sessionKey)) return null;
  try {
    return await request('/me', { authenticated: true });
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'POST', authenticated: true });
  } catch (error) {
    if (error.status !== 401) throw error;
  }
  sessionStorage.removeItem(sessionKey);
}

async function getEntry(collection, id) {
  if (!id) return null;
  try {
    return await request('/' + collection + '/' + encodeURIComponent(id));
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export const getWorkouts = () => request('/workouts');
export const getWorkout = id => getEntry('workouts', id);
export const getArticles = () => request('/articles');
export const getArticle = id => getEntry('articles', id);
export const register = credentials => authenticate('register', credentials);
export const login = credentials => authenticate('login', credentials);
export const getActivity = () => request('/activity', { authenticated: true });
export const addPlan = body => request('/activity/plan', { method: 'POST', body, authenticated: true });
export const removePlan = id => request('/activity/plan/' + encodeURIComponent(id), { method: 'DELETE', authenticated: true });
export const completePlan = id => request('/activity/plan/' + encodeURIComponent(id) + '/complete', { method: 'POST', authenticated: true });
export const completeWorkout = workout => request('/activity/complete', { method: 'POST', body: { workout }, authenticated: true });

export const today = () => new Intl.DateTimeFormat('sv-SE').format(new Date());
