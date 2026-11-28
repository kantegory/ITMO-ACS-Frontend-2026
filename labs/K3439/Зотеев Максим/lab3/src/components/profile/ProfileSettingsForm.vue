<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  user: { type: Object, required: true },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['save'])

const validationError = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notify: false,
})

watch(
  () => props.user,
  (next) => {
    if (!next) return
    form.firstName = next.firstName ?? ''
    form.lastName = next.lastName ?? ''
    form.email = next.email ?? ''
    form.phone = next.phone ?? ''
    form.notify = Boolean(next.notify)
  },
  { immediate: true },
)

function handleSubmit() {
  if (!form.firstName || !form.lastName || !form.email) {
    validationError.value = 'Имя, фамилия и email не могут быть пустыми.'
    return
  }
  validationError.value = ''
  emit('save', {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    notify: form.notify,
  })
}
</script>

<template>
  <form class="card card-body" @submit.prevent="handleSubmit" @input="validationError = ''">
    <p v-if="validationError" class="alert alert-danger" role="alert">
      {{ validationError }}
    </p>
    <fieldset :disabled="saving">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="settings-firstName" class="form-label">Имя</label>
          <input
            id="settings-firstName"
            v-model.trim="form.firstName"
            type="text"
            class="form-control"
            autocomplete="given-name"
            required
          >
        </div>
        <div class="col-md-6 mb-3">
          <label for="settings-lastName" class="form-label">Фамилия</label>
          <input
            id="settings-lastName"
            v-model.trim="form.lastName"
            type="text"
            class="form-control"
            autocomplete="family-name"
            required
          >
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="settings-email" class="form-label">Email</label>
          <input
            id="settings-email"
            v-model.trim="form.email"
            type="email"
            class="form-control"
            autocomplete="email"
            required
          >
        </div>
        <div class="col-md-6 mb-3">
          <label for="settings-phone" class="form-label">Телефон</label>
          <input
            id="settings-phone"
            v-model.trim="form.phone"
            type="tel"
            class="form-control"
            autocomplete="tel"
          >
        </div>
      </div>

      <div class="form-check mb-3">
        <input
          id="settings-notify"
          v-model="form.notify"
          class="form-check-input"
          type="checkbox"
        >
        <label class="form-check-label" for="settings-notify">
          Получать уведомления о новых сообщениях
        </label>
      </div>

      <div>
        <button type="submit" class="btn btn-primary">
          {{ saving ? 'Сохранение…' : 'Сохранить' }}
        </button>
      </div>
    </fieldset>
  </form>
</template>
