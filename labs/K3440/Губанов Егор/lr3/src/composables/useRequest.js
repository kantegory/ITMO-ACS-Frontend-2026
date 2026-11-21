import { onScopeDispose, ref } from 'vue'
import axios from 'axios'

export function useRequest(loader, { keepData = false } = {}) {
    const data = ref(null)
    const loading = ref(false)
    const error = ref('')
    const errorStatus = ref(0)
    let controller
    let version = 0

    async function execute(...args) {
        const current = ++version
        controller?.abort()
        controller = new AbortController()
        loading.value = true
        error.value = ''
        errorStatus.value = 0

        if (!keepData) data.value = null

        try {
            const result = await loader(controller.signal, ...args)
            if (current !== version) return null
            data.value = result
            return result
        } catch (cause) {
            if (current === version && !axios.isCancel(cause)) {
                error.value = cause.message || 'Произошла ошибка.'
                errorStatus.value = cause.status || 0
            }
            return null
        } finally {
            if (current === version) loading.value = false
        }
    }

    onScopeDispose(() => {
        version += 1
        controller?.abort()
    })

    return { data, loading, error, errorStatus, execute }
}