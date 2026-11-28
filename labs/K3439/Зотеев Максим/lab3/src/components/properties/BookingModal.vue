<script setup>
import { reactive, ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { VIEWING_TIMES } from '@/composables/useFormatters'

defineProps({
  submitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const modalRef = ref(null)
const form = reactive({
  date: '',
  time: VIEWING_TIMES[0],
})

function todayLocalISO() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const minDate = ref(todayLocalISO())

function open() {
  minDate.value = todayLocalISO()
  form.date = ''
  form.time = VIEWING_TIMES[0]
  modalRef.value?.show()
}

function close() {
  modalRef.value?.hide()
}

function handleSubmit() {
  emit('submit', { date: form.date, time: form.time })
}

defineExpose({ show: open, hide: close })
</script>

<template>
  <BaseModal id="bookingModal" ref="modalRef" title="Запись на просмотр">
    <form @submit.prevent="handleSubmit">
      <div class="modal-body">
        <div class="mb-3">
          <label for="booking-date" class="form-label">Дата</label>
          <input
            id="booking-date"
            v-model="form.date"
            type="date"
            class="form-control"
            :min="minDate"
            :disabled="submitting"
            required
          >
        </div>
        <div class="mb-3">
          <label for="booking-time" class="form-label">Время</label>
          <select
            id="booking-time"
            v-model="form.time"
            class="form-select"
            :disabled="submitting"
          >
            <option v-for="time in VIEWING_TIMES" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="submitting">
          Отмена
        </button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Отправка…' : 'Записаться' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
