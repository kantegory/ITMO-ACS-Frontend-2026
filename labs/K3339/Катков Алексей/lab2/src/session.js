const KEY = 'shchepotka-lab1-session'
export function session() {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || null } catch { return null }
}
export function saveSession(value) {
  if (value) sessionStorage.setItem(KEY, JSON.stringify(value))
  else sessionStorage.removeItem(KEY)
}
