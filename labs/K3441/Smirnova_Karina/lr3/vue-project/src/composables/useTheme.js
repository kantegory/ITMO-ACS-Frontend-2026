import { computed, ref } from 'vue'

const STORAGE_KEY = 'rentSpaceTheme'
const AVAILABLE_THEMES = ['light', 'dark']

const theme = ref('light')

function readSavedTheme() {
    try {
        const savedTheme = localStorage.getItem(STORAGE_KEY)

        if (AVAILABLE_THEMES.includes(savedTheme)) {
            return savedTheme
        }
    } catch {
        // Если localStorage недоступен, используем светлую тему.
    }

    return 'light'
}

function applyTheme(nextTheme) {
    document.documentElement.dataset.theme = nextTheme
    document.documentElement.style.colorScheme = nextTheme
}

export function useTheme() {
    const isDark = computed(() => theme.value === 'dark')

    function initializeTheme() {
        theme.value = readSavedTheme()
        applyTheme(theme.value)
    }

    function setTheme(nextTheme) {
        if (!AVAILABLE_THEMES.includes(nextTheme)) {
            return
        }

        theme.value = nextTheme
        applyTheme(nextTheme)

        try {
            localStorage.setItem(STORAGE_KEY, nextTheme)
        } catch {
            // Тема продолжит работать в открытой вкладке.
        }
    }

    function toggleTheme() {
        setTheme(isDark.value ? 'light' : 'dark')
    }

    return {
        theme,
        isDark,
        initializeTheme,
        setTheme,
        toggleTheme,
    }
}