<script setup>
import { reactive, ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { CITIES, PROPERTY_TYPES } from '@/composables/useFormatters'

defineProps({
  submitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const modalRef = ref(null)
const addressError = ref('')

function createDefaultForm() {
  return {
    type: PROPERTY_TYPES[0],
    city: CITIES[0],
    address: '',
    area: '',
    price: '',
    description: '',
  }
}

const form = reactive(createDefaultForm())

function resetForm() {
  Object.assign(form, createDefaultForm())
  addressError.value = ''
}

function open() {
  addressError.value = ''
  modalRef.value?.show()
}

function close() {
  modalRef.value?.hide()
}

function handleSubmit() {
  if (!form.address.trim()) {
    addressError.value = 'Укажите адрес объекта.'
    return
  }
  addressError.value = ''
  emit('submit', {
    type: form.type,
    city: form.city,
    address: form.address.trim(),
    area: Number(form.area),
    price: Number(form.price),
    description: form.description.trim(),
  })
}

defineExpose({ show: open, hide: close, reset: resetForm })
</script>

<template>
  <BaseModal id="addPropertyModal" ref="modalRef" title="Новое объявление">
    <form @submit.prevent="handleSubmit">
      <div class="modal-body">
        <div class="mb-3">
          <label for="new-type" class="form-label">Тип жилья</label>
          <select id="new-type" v-model="form.type" class="form-select" :disabled="submitting">
            <option v-for="type in PROPERTY_TYPES" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label for="new-city" class="form-label">Город</label>
          <select id="new-city" v-model="form.city" class="form-select" :disabled="submitting">
            <option v-for="city in CITIES" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label for="new-address" class="form-label">Адрес</label>
          <input
            id="new-address"
            v-model.trim="form.address"
            type="text"
            :class="['form-control', { 'is-invalid': Boolean(addressError) }]"
            :aria-invalid="addressError ? 'true' : undefined"
            :disabled="submitting"
            required
            @input="addressError = ''"
          >
          <p v-if="addressError" class="invalid-feedback d-block mb-0" role="alert">
            {{ addressError }}
          </p>
        </div>

        <div class="row">
          <div class="col-sm-6 mb-3">
            <label for="new-area" class="form-label">Площадь, м²</label>
            <input
              id="new-area"
              v-model="form.area"
              type="number"
              class="form-control"
              min="1"
              :disabled="submitting"
              required
            >
          </div>
          <div class="col-sm-6 mb-3">
            <label for="new-price" class="form-label">Цена, ₽ в месяц</label>
            <input
              id="new-price"
              v-model="form.price"
              type="number"
              class="form-control"
              min="0"
              :disabled="submitting"
              required
            >
          </div>
        </div>

        <div class="mb-3">
          <label for="new-description" class="form-label">Описание</label>
          <textarea
            id="new-description"
            v-model="form.description"
            class="form-control"
            rows="3"
            :disabled="submitting"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="submitting">
          Отмена
        </button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Публикация…' : 'Опубликовать' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
