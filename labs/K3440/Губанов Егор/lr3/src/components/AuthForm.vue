<script setup>
import { computed, reactive, ref, nextTick } from 'vue'
import { TYPES } from '../constants.js'
import StatusMessage from './StatusMessage.vue'

const props = defineProps({
  mode: { type: String, required: true },
  busy: { type: Boolean, default: false },
  error: { type: String, default: '' }
})
const emit = defineEmits(['submit'])
const register = computed(() => props.mode === 'register')
const form = ref(null)
const fields = reactive({ name: '', email: '', password: '', confirmPassword: '', goal: 'pilates' })
const localError = ref('')
const confirmError = ref('')
const confirmInput = ref(null)

async function submit() {
  localError.value = ''
  confirmError.value = ''

  if (!form.value.reportValidity()) return

  if (register.value && !fields.name.trim()) {
    localError.value = 'Укажи имя.'
    return
  }

  if (register.value && fields.password !== fields.confirmPassword) {
    confirmError.value = 'Пароли должны совпадать.'
    await nextTick()
    confirmInput.value?.focus()
    return
  }

  const body = { email: fields.email.trim().toLowerCase(), password: fields.password }
  if (register.value) Object.assign(body, { name: fields.name.trim(), goal: fields.goal })
  emit('submit', body)
}
</script>

<template>
  <form ref="form" class="mt-4" @submit.prevent="submit">
    <fieldset :disabled="busy">
      <legend class="visually-hidden">{{ register ? 'Данные для регистрации' : 'Данные для входа' }}</legend>
      <div v-if="register" class="mb-3">
        <label class="form-label" for="authName">Имя</label>
        <input id="authName" v-model="fields.name" class="form-control" autocomplete="given-name" maxlength="60" required>
      </div>
      <div class="mb-3">
        <label class="form-label" for="authEmail">Почта</label>
        <input id="authEmail" v-model="fields.email" class="form-control" type="email" autocomplete="email" required>
      </div>
      <div class="mb-3">
        <label class="form-label" for="authPassword">Пароль</label>
        <input id="authPassword" v-model="fields.password" class="form-control" type="password"
               :autocomplete="register ? 'new-password' : 'current-password'" minlength="6" required aria-describedby="passwordHelp" @input="confirmError = ''">
        <p id="passwordHelp" class="small mt-1">Минимум 6 символов.</p>
      </div>
      <div v-if="register" class="mb-3">
        <label class="form-label" for="authConfirm">Повтори пароль</label>
        <input id="authConfirm" ref="confirmInput" v-model="fields.confirmPassword" class="form-control"
               type="password" autocomplete="new-password" minlength="6" required
               :aria-invalid="Boolean(confirmError)"
               :aria-describedby="confirmError ? 'authConfirmError' : undefined"
               @input="confirmError = ''">
        <p v-if="confirmError" id="authConfirmError" class="small text-danger mt-1 mb-0">
          {{ confirmError }}
        </p>
      </div>
      <div v-if="register" class="mb-4">
        <label class="form-label" for="authGoal">Что тебе ближе?</label>
        <select id="authGoal" v-model="fields.goal" class="form-select">
          <option v-for="(title, key) in TYPES" :key="key" :value="key">{{ title }}</option>
        </select>
      </div>
      <button class="btn btn-brutal btn-clay w-100" type="submit">
        {{ busy ? 'Отправляем…' : register ? 'Зарегистрироваться' : 'Войти' }}
      </button>
    </fieldset>
    <StatusMessage :message="localError || error" :error="Boolean(localError || error)" />
  </form>
</template>