import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'vice-theme'
const THEMES = ['sunset', 'night']

function preferredTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'night'
    : 'sunset'
}

function readTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (THEMES.includes(saved)) return saved
  return preferredTheme()
}

const theme = ref(readTheme())

function apply(themeName) {
  const next = THEMES.includes(themeName) ? themeName : 'sunset'
  theme.value = next
  document.documentElement.dataset.theme = next
  localStorage.setItem(STORAGE_KEY, next)
}

export function useTheme() {
  onMounted(() => apply(theme.value))

  watch(theme, (v) => apply(v), { immediate: true })

  function toggleTheme() {
    apply(theme.value === 'night' ? 'sunset' : 'night')
  }

  return {
    theme,
    isNight: () => theme.value === 'night',
    toggleTheme,
    setTheme: apply,
  }
}
