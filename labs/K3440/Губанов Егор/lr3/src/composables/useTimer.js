import { computed, onScopeDispose, ref } from 'vue'

export function useTimer(steps) {
    const index = ref(0)
    const remaining = ref(steps[0]?.seconds || 0)
    const running = ref(false)
    const finished = ref(steps.length === 0)
    let interval = null
    let deadline = 0

    const formatted = computed(() => {
        const minutes = String(Math.floor(remaining.value / 60)).padStart(2, '0')
        const seconds = String(remaining.value % 60).padStart(2, '0')
        return `${minutes}:${seconds}`
    })

    function stop() {
        clearInterval(interval)
        interval = null
        running.value = false
    }

    function tick() {
        const now = Date.now()
        while (now >= deadline && !finished.value) {
            if (index.value === steps.length - 1) {
                finished.value = true
                remaining.value = 0
                stop()
            } else {
                index.value += 1
                deadline += steps[index.value].seconds * 1000
            }
        }
        if (!finished.value) remaining.value = Math.max(0, Math.ceil((deadline - now) / 1000))
    }

    function toggle() {
        if (!steps.length) return
        if (running.value) {
            tick()
            stop()
            return
        }
        if (finished.value) {
            index.value = 0
            remaining.value = steps[0].seconds
            finished.value = false
        }
        deadline = Date.now() + remaining.value * 1000
        running.value = true
        interval = setInterval(tick, 250)
    }

    function next() {
        if (finished.value) return
        if (index.value === steps.length - 1) {
            finished.value = true
            remaining.value = 0
            stop()
        } else {
            index.value += 1
            remaining.value = steps[index.value].seconds
            if (running.value) deadline = Date.now() + remaining.value * 1000
        }
    }

    onScopeDispose(stop)

    return { index, remaining, running, finished, formatted, toggle, next }
}