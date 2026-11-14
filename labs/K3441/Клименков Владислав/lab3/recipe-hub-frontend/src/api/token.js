/**
 * token.js — хранение и декодирование JWT.
 *
 * «Запомнить меня» определяет, где лежит токен: localStorage (переживает
 * закрытие браузера) или sessionStorage (только текущая вкладка).
 */

const TOKEN_KEY = 'rh_token';

/** Токен из localStorage или sessionStorage. */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

/** Сохранить токен. remember=true — переживает закрытие браузера. */
export function saveToken(token, remember = true) {
  clearToken();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
}

/** Удалить токен из обоих хранилищ. */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

/** Декодировать payload JWT без сторонних библиотек. */
export function decodeJwt(token) {
  const [, payload] = String(token).split('.');
  if (!payload) throw new Error('Некорректный токен');

  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const json = decodeURIComponent(
    atob(padded)
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );

  return JSON.parse(json);
}
