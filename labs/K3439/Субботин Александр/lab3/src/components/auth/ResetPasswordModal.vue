<script setup>
import { ref, useTemplateRef } from 'vue'

import BaseModal from '@/components/ui/BaseModal.vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { useToast } from '@/composables/useToast'

// Отдельного эндпоинта для сброса пароля у json-server-auth нет — только имитация
const modal = useTemplateRef('modal')
const form = useTemplateRef('form')
const { validated, resync, onSubmit, resetValidation } = useFormValidation(form)
const { showToast } = useToast()

const email = ref('')

const submit = onSubmit(() => {
  modal.value.hide()
  showToast(`Ссылка для сброса пароля отправлена на ${email.value}`)
  email.value = ''
  resetValidation()
})

defineExpose({ show: (trigger) => modal.value.show(trigger) })
</script>

<template>
  <BaseModal ref="modal" labelledby="resetModalTitle">
    <form
      ref="form"
      class="modal-content needs-validation"
      :class="{ 'was-validated': validated }"
      novalidate
      @submit.prevent="submit"
      @input="resync"
    >
      <div class="modal-header">
        <h2 id="resetModalTitle" class="modal-title h5">Восстановление пароля</h2>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
      </div>
      <div class="modal-body">
        <p class="text-muted-warm">Укажите почту, на которую зарегистрирован аккаунт, — пришлём ссылку для сброса пароля.</p>
        <label class="form-label" for="resetEmail">Электронная почта</label>
        <input id="resetEmail" v-model="email" class="form-control" type="email" autocomplete="email" required aria-errormessage="resetEmailError">
        <div id="resetEmailError" class="invalid-feedback">Введите корректный адрес почты.</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отмена</button>
        <button type="submit" class="btn btn-primary">Отправить ссылку</button>
      </div>
    </form>
  </BaseModal>
</template>
