import { readonly, ref } from 'vue'

import darkThemeCss from '@/assets/styles/themes/dark.css?inline'

// Тема оформления из ДЗ3. Светлая тема подключена всегда (main.js), тёмная лежит в отдельном
// <style media="(prefers-color-scheme: dark)"> — то есть по умолчанию «как в системе».
// Переключатель меняет этот media: 'all' — тёмная тема всегда, 'not all' — никогда

const THEME_KEY = 'theme'
const SYSTEM_DARK = '(prefers-color-scheme: dark)'
const THEME_MEDIA = { auto: SYSTEM_DARK, dark: 'all', light: 'not all' }

export const THEMES = [
  { value: 'light', label: 'Светлая', title: 'светлая', icon: 'sun' },
  { value: 'dark', label: 'Тёмная', title: 'тёмная', icon: 'moon' },
  { value: 'auto', label: 'Как в системе', title: 'как в системе', icon: 'contrast' },
]

const systemDarkQuery = window.matchMedia(SYSTEM_DARK)
const darkStyle = document.createElement('style')

function getStoredTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY)
    return theme in THEME_MEDIA ? theme : 'auto'
  } catch {
    return 'auto'
  }
}

const theme = ref(getStoredTheme())

function applyTheme() {
  darkStyle.media = THEME_MEDIA[theme.value]
  const isDark = theme.value === 'dark' || (theme.value === 'auto' && systemDarkQuery.matches)
  // По data-bs-theme Bootstrap перекрашивает свои компоненты: крестики модалок, стрелки селектов, меню
  document.documentElement.dataset.bsTheme = isDark ? 'dark' : 'light'
}

function setTheme(value) {
  theme.value = value
  try {
    if (value === 'auto') localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, value)
  } catch {
    // без localStorage тема просто не запомнится
  }
  applyTheme()
}

// Вызывается в main.js до монтирования приложения, чтобы страница сразу отрисовалась в нужной теме.
// <style> добавляется последним в <head> — после Bootstrap и светлой темы, поэтому его переменные важнее
export function installTheme() {
  darkStyle.id = 'darkTheme'
  darkStyle.textContent = darkThemeCss
  document.head.append(darkStyle)
  applyTheme()

  // Тема в системе поменялась (например, вечером) — подстраиваемся, если выбрано «как в системе»
  systemDarkQuery.addEventListener('change', applyTheme)

  // Тему переключили в другой вкладке
  window.addEventListener('storage', (event) => {
    if (event.key !== THEME_KEY && event.key !== null) return
    theme.value = getStoredTheme()
    applyTheme()
  })
}

export function useTheme() {
  return { theme: readonly(theme), setTheme }
}
