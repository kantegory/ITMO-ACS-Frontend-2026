// Сохранённая сессия: ключи localStorage, чтение пользователя и токена, вход и выход.

export const USER_KEY = "fitnessPlatformUser";
const TOKEN_KEY = "fitnessPlatformToken";

export function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

// Сохранение и очистка пользовательской сессии.
export function saveSession(payload) {
  localStorage.setItem(TOKEN_KEY, payload.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  document.body.classList.add("is-authenticated");
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.body.classList.remove("is-authenticated");
}

