import { computed, ref, shallowRef } from 'vue'
import { api } from '../api/index.js'
import { DAYS } from '../constants.js'
import { currentUser, session } from '../state/session.js'

const savingSession = shallowRef(null)

export function usePlan() {
    const saving = computed(() => session.value !== null && savingSession.value === session.value)
    const error = ref('')
    const message = ref('')
    const plan = computed(() => [...(currentUser.value?.plan || [])].sort((a, b) =>
        Object.keys(DAYS).indexOf(a.day) - Object.keys(DAYS).indexOf(b.day)
    ))
    const completed = computed(() => plan.value.filter(item => item.completed).length)
    const percent = computed(() => plan.value.length
        ? Math.round(completed.value / plan.value.length * 100)
        : 0)

    async function save(change, success = 'План сохранён.') {
        if (saving.value) return false
        resetStatus()

        const activeSession = session.value
        if (!activeSession) {
            error.value = 'Сначала войди в аккаунт.'
            return false
        }

        savingSession.value = activeSession
        try {
            const user = await api.updatePlan(activeSession.userId, change)
            if (session.value !== activeSession) return false
            currentUser.value = user
            message.value = success
            return true
        } catch (cause) {
            if (session.value === activeSession) error.value = cause.message
            return false
        } finally {
            if (savingSession.value === activeSession) savingSession.value = null
        }
    }

    function add(day, trainingId) {
        return save({ action: 'add', day, trainingId }, `План сохранён: ${DAYS[day]}.`)
    }

    function toggle(day, trainingId, completed) {
        return save({ action: 'complete', day, trainingId, completed })
    }

    function remove(day, trainingId) {
        return save({ action: 'remove', day, trainingId })
    }

    function finish(day, trainingId) {
        return save({ action: 'complete', day, trainingId, completed: true }, 'Занятие отмечено в твоём плане.')
    }

    function resetStatus() {
        error.value = ''
        message.value = ''
    }

    return { plan, completed, percent, saving, error, message, add, toggle, remove, finish, resetStatus }
}