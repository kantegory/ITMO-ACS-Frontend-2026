import { ref } from 'vue'

const message = ref('')
const isVisible = ref(false)

let timeoutId = null

export function useToast() {
    function showToast(nextMessage, duration = 3000) {
        message.value = nextMessage
        isVisible.value = true

        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
            hideToast()
        }, duration)
    }

    function hideToast() {
        isVisible.value = false

        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
    }

    return {
        message,
        isVisible,
        showToast,
        hideToast,
    }
}