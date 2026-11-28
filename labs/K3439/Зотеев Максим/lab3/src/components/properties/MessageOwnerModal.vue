<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'

const DEFAULT_TEXT = 'Здравствуйте! Квартира ещё сдаётся?'

defineProps({
  submitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const modalRef = ref(null)
const text = ref(DEFAULT_TEXT)
const validationError = ref('')

function open() {
  text.value = DEFAULT_TEXT
  validationError.value = ''
  modalRef.value?.show()
}

function close() {
  modalRef.value?.hide()
}

function handleSubmit() {
  const trimmed = text.value.trim()
  if (!trimmed) {
    validationError.value = 'Введите текст сообщения.'
    return
  }
  validationError.value = ''
  emit('submit', trimmed)
}

defineExpose({ show: open, hide: close })
</script>

<template>
  <BaseModal id="messageModal" ref="modalRef" title="Сообщение владельцу">
    <form @submit.prevent="handleSubmit">
      <div class="modal-body">
        <label for="owner-message-text" class="form-label">Текст сообщения</label>
        <textarea
          id="owner-message-text"
          v-model="text"
          :class="['form-control', { 'is-invalid': Boolean(validationError) }]"
          :aria-invalid="validationError ? 'true' : undefined"
          rows="4"
          :disabled="submitting"
          required
          @input="validationError = ''"
        ></textarea>
        <p v-if="validationError" class="invalid-feedback d-block mb-0" role="alert">
          {{ validationError }}
        </p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="submitting">
          Отмена
        </button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Отправка…' : 'Отправить' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
