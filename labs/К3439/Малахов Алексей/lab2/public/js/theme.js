const darkQuery = matchMedia('(prefers-color-scheme: dark)')

function savedTheme() {
  try {
    return localStorage.getItem('theme')
  } catch {
    return null
  }
}

function currentTheme() {
  return savedTheme() || (darkQuery.matches ? 'dark' : 'light')
}

function applyTheme() {
  const theme = currentTheme()
  const root = document.documentElement
  root.dataset.bsTheme = theme
  if (savedTheme()) {
    root.dataset.theme = theme
  } else {
    delete root.dataset.theme
  }

  const button = document.getElementById('themeToggle')
  if (!button || typeof icon !== 'function') return
  const dark = theme === 'dark'
  button.innerHTML = `${icon(dark ? 'sun' : 'moon')}<span class="visually-hidden">Тёмная тема</span>`
  button.setAttribute('aria-pressed', String(dark))
  button.title = dark ? 'Включить светлую тему' : 'Включить тёмную тему'
}

applyTheme()
darkQuery.addEventListener('change', applyTheme)

document.addEventListener('DOMContentLoaded', () => {
  applyTheme()
  document.getElementById('themeToggle').addEventListener('click', () => {
    try {
      localStorage.setItem('theme', currentTheme() === 'dark' ? 'light' : 'dark')
    } catch {}
    applyTheme()
  })
})
