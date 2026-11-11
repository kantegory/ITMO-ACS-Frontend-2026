import { computed, ref, watchEffect } from 'vue'

// Тема оформления: 'light', 'dark' или 'auto' (как в системе).
// Состояние общее для всего приложения, поэтому объявлено вне функции.
const STORAGE_KEY = 'theme'
const systemQuery = window.matchMedia('(prefers-color-scheme: dark)')

function readTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'auto'
  } catch {
    return 'auto'
  }
}

const theme = ref(readTheme())
const systemDark = ref(systemQuery.matches)
systemQuery.addEventListener('change', (event) => {
  systemDark.value = event.matches
})

const effectiveTheme = computed(() =>
  theme.value === 'auto' ? (systemDark.value ? 'dark' : 'light') : theme.value
)

// data-theme включает тёмные CSS-переменные, data-bs-theme — тёмные компоненты Bootstrap
watchEffect(() => {
  document.documentElement.dataset.theme = effectiveTheme.value
  document.documentElement.dataset.bsTheme = effectiveTheme.value
})

export const THEME_OPTIONS = [
  { value: 'light', label: 'Светлая', icon: 'sun' },
  { value: 'dark', label: 'Тёмная', icon: 'moon' },
  { value: 'auto', label: 'Как в системе', icon: 'screen' }
]

export function useTheme() {
  function setTheme(value) {
    theme.value = value
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // без localStorage выбор просто не запомнится
    }
  }

  return { theme, effectiveTheme, setTheme }
}
