import { onScopeDispose, ref, watch, watchEffect } from 'vue'

const key = 'vmeste-theme'

export function useTheme() {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const mode = ref('system')
    const systemDark = ref(media.matches)

    try {
        const saved = localStorage.getItem(key)
        if (saved === 'light' || saved === 'dark') mode.value = saved
    } catch {}

    function onSystemChange(event) {
        systemDark.value = event.matches
    }

    media.addEventListener('change', onSystemChange)
    onScopeDispose(() => media.removeEventListener('change', onSystemChange))

    watchEffect(() => {
        document.documentElement.dataset.bsTheme =
            mode.value === 'system' ? (systemDark.value ? 'dark' : 'light') : mode.value
    })

    watch(mode, value => {
        try {
            localStorage.setItem(key, value)
        } catch {}
    })

    return { mode }
}