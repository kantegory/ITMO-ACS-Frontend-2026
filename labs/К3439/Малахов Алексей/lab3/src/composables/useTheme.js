import { ref } from 'vue'

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
const theme = ref('light')

function savedTheme() {
  try {
    return localStorage.getItem('theme')
  } catch {
    return null
  }
}

function apply() {
  const saved = savedTheme()
  theme.value = saved || (darkQuery.matches ? 'dark' : 'light')
  const root = document.documentElement
  root.dataset.bsTheme = theme.value
  if (saved) root.dataset.theme = saved
  else delete root.dataset.theme
}

apply()
darkQuery.addEventListener('change', apply)

export function useTheme() {
  function toggle() {
    try {
      localStorage.setItem('theme', theme.value === 'dark' ? 'light' : 'dark')
    } catch {
      return
    }
    apply()
  }

  return { theme, toggle }
}
