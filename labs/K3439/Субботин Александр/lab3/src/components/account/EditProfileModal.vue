<script setup>
import { reactive, useTemplateRef } from 'vue'

import BaseModal from '@/components/ui/BaseModal.vue'
import { useAuth } from '@/composables/useAuth'
import { useFormValidation } from '@/composables/useFormValidation'
import { useToast } from '@/composables/useToast'

const { user, updateUser } = useAuth()
const { showToast } = useToast()

const modal = useTemplateRef('modal')
const form = useTemplateRef('form')
const { validated, submitting, formError, resync, onSubmit, resetValidation } = useFormValidation(form)

const profile = reactive({ name: '', email: '', phone: '', birthday: '' })

// При каждом открытии — текущие данные пользователя и чистая форма
function onShow() {
  Object.assign(profile, {
    name: user.value.name,
    email: user.value.email,
    phone: user.value.phone ?? '',
    birthday: user.value.birthday ?? '',
  })
  resetValidation()
}

const submit = onSubmit(async () => {
  await updateUser({
    name: profile.name.trim(),
    email: profile.email.trim().toLowerCase(),
    phone: profile.phone.trim(),
    birthday: profile.birthday,
  })
  modal.value.hide()
  showToast('Профиль сохранён')
})

defineExpose({ show: (trigger) => modal.value.show(trigger) })
</script>

<template>
  <BaseModal ref="modal" labelledby="editProfileTitle" @show="onShow">
    <form
      ref="form"
      class="modal-content needs-validation"
      :class="{ 'was-validated': validated }"
      novalidate
      @submit.prevent="submit"
      @input="resync"
      @change="resync"
    >
      <div class="modal-header">
        <h2 id="editProfileTitle" class="modal-title h5">Редактирование профиля</h2>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label" for="editName">Имя и фамилия</label>
          <input id="editName" v-model="profile.name" class="form-control" type="text" autocomplete="name" minlength="2" required aria-errormessage="editNameError">
          <div id="editNameError" class="invalid-feedback">Укажите имя.</div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="editEmail">Электронная почта</label>
          <input id="editEmail" v-model="profile.email" class="form-control" type="email" autocomplete="email" required aria-errormessage="editEmailError">
          <div id="editEmailError" class="invalid-feedback">Введите корректный адрес почты.</div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="editPhone">Телефон</label>
          <input
            id="editPhone"
            v-model="profile.phone"
            class="form-control"
            type="tel"
            autocomplete="tel"
            pattern="^\+?[0-9\s\-\(\)]{10,18}$"
            required
            aria-errormessage="editPhoneError"
          >
          <div id="editPhoneError" class="invalid-feedback">Например: +7 900 123-45-67.</div>
        </div>
        <div>
          <label class="form-label" for="editBirthday">День рождения <span class="text-muted-warm small">(пришлём комплимент от ресторанов)</span></label>
          <input id="editBirthday" v-model="profile.birthday" class="form-control" type="date">
        </div>
        <div v-if="formError" class="alert alert-danger mt-3 mb-0" role="alert">{{ formError }}</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отмена</button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">Сохранить</button>
      </div>
    </form>
  </BaseModal>
</template>
