import { ref, watchEffect } from 'vue'

const system = matchMedia('(prefers-color-scheme: dark)')
const theme = ref(document.documentElement.dataset.theme)

system.addEventListener('change', event => {
  if (!localStorage.getItem('theme')) theme.value = event.matches ? 'dark' : 'light'
})

watchEffect(() => {
  document.documentElement.dataset.theme = theme.value
  document.documentElement.dataset.bsTheme = theme.value
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', theme.value)
  }

  return { theme, toggleTheme }
}
