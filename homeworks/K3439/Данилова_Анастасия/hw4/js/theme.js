const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')

function getTheme() {
  return localStorage.getItem('theme') || (darkMedia.matches ? 'dark' : 'light')
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.setAttribute('data-bs-theme', theme)

  const btn = document.getElementById('theme-toggle')
  if (btn) {
    btn.querySelector('use').setAttribute('href', 'img/sprite.svg#icon-' + (theme === 'dark' ? 'sun' : 'moon'))
    btn.setAttribute('aria-pressed', theme === 'dark')
  }
}

applyTheme(getTheme())

darkMedia.addEventListener('change', () => {
  if (!localStorage.getItem('theme')) applyTheme(getTheme())
})

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('theme-toggle')
  if (!btn) return

  applyTheme(getTheme())
  btn.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    applyTheme(next)
  })
})
