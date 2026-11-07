<script setup>
import { reactive, ref, watch } from 'vue'

import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const { user, updateUser } = useAuth()
const { showToast } = useToast()

const settings = reactive({ email: false, sms: false, news: false, remindBefore: 2 })
const saving = ref(false)

// Форма — копия настроек пользователя: обновили профиль с сервера — обновили и форму
watch(() => user.value?.notifications, (notifications = {}) => {
  Object.assign(settings, {
    email: Boolean(notifications.email),
    sms: Boolean(notifications.sms),
    news: Boolean(notifications.news),
    remindBefore: notifications.remindBefore ?? 2,
  })
}, { immediate: true })

async function save() {
  saving.value = true
  try {
    await updateUser({ notifications: { ...settings } })
    showToast('Настройки уведомлений сохранены')
  } catch (error) {
    showToast(error.message, 'danger')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form @submit.prevent="save">
    <div class="form-check form-switch mb-2">
      <input id="notifyEmail" v-model="settings.email" class="form-check-input" type="checkbox" role="switch">
      <label class="form-check-label" for="notifyEmail">Подтверждения брони на почту</label>
    </div>
    <div class="form-check form-switch mb-2">
      <input id="notifySms" v-model="settings.sms" class="form-check-input" type="checkbox" role="switch">
      <label class="form-check-label" for="notifySms">SMS-напоминания о визите</label>
    </div>
    <div class="form-check form-switch mb-3">
      <input id="notifyNews" v-model="settings.news" class="form-check-input" type="checkbox" role="switch">
      <label class="form-check-label" for="notifyNews">Подборки ресторанов и акции</label>
    </div>
    <div class="row g-2 align-items-end">
      <div class="col-sm-6">
        <label class="form-label" for="remindBefore">Напоминать о визите за</label>
        <select id="remindBefore" v-model.number="settings.remindBefore" class="form-select">
          <option :value="1">1 час</option>
          <option :value="2">2 часа</option>
          <option :value="24">1 день</option>
        </select>
      </div>
      <div class="col-sm-6">
        <button class="btn btn-primary w-100" type="submit" :disabled="saving">Сохранить настройки</button>
      </div>
    </div>
  </form>
</template>
