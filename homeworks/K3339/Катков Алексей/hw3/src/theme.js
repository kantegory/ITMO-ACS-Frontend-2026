const KEY = 'shchepotka-color-theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')
const choices = ['system', 'light', 'dark']
let choice = 'system'

try {
  const saved = localStorage.getItem(KEY)
  if (choices.includes(saved)) choice = saved
} catch {}

function apply() {
  const dark = choice === 'dark' || (choice === 'system' && media.matches)
  const theme = dark ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  document.documentElement.dataset.bsTheme = theme
  document.documentElement.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#162019' : '#fcfaf6')
  syncThemeControl()
}

export function syncThemeControl() {
  const control = document.querySelector('#theme-select')
  if (control) control.value = choice
}

document.addEventListener('change', (event) => {
  if (event.target.id !== 'theme-select' || !choices.includes(event.target.value)) return
  choice = event.target.value
  try { localStorage.setItem(KEY, choice) } catch {}
  apply()
})

media.addEventListener('change', () => { if (choice === 'system') apply() })
window.addEventListener('storage', (event) => {
  if (event.key !== KEY && event.key !== null) return
  choice = choices.includes(event.newValue) ? event.newValue : 'system'
  apply()
})

apply()
