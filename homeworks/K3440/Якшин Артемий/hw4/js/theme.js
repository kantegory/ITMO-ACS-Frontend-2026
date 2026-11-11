// Тема оформления: 'light', 'dark' или 'auto' (как в настройках системы).
// Скрипт подключён в <head> без defer, чтобы тема применилась до отрисовки
// страницы и не было «вспышки» светлой темы.
;(() => {
  const STORAGE_KEY = 'theme'
  const LABELS = { light: 'светлая', dark: 'тёмная', auto: 'как в системе' }
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)')
  const darkStylesheet = document.getElementById('darkTheme')

  function getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'auto'
    } catch {
      return 'auto'
    }
  }

  function applyTheme(theme) {
    // dark.css подключается всегда, никогда или по системной настройке
    darkStylesheet.media = { dark: 'all', light: 'not all', auto: '(prefers-color-scheme: dark)' }[theme]

    // компоненты Bootstrap (меню, модальные окна, крестики) переключаем атрибутом
    const isDark = theme === 'dark' || (theme === 'auto' && systemDark.matches)
    document.documentElement.dataset.bsTheme = isDark ? 'dark' : 'light'

    document.querySelectorAll('[data-theme-value]').forEach((item) => {
      const selected = item.dataset.themeValue === theme
      item.classList.toggle('active', selected)
      item.setAttribute('aria-pressed', selected)
    })
    document.getElementById('themeButton')?.setAttribute('aria-label', `Тема оформления: ${LABELS[theme]}`)
  }

  applyTheme(getTheme())

  // если выбрано «как в системе», следим за сменой темы в ОС
  systemDark.addEventListener('change', () => {
    if (getTheme() === 'auto') applyTheme('auto')
  })

  document.addEventListener('DOMContentLoaded', () => applyTheme(getTheme()))

  document.addEventListener('click', (event) => {
    const item = event.target.closest('[data-theme-value]')
    if (!item) return
    try {
      localStorage.setItem(STORAGE_KEY, item.dataset.themeValue)
    } catch {
      // без localStorage тема просто не запомнится
    }
    applyTheme(item.dataset.themeValue)
  })
})()
