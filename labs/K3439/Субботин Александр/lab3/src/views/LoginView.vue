<script setup>
import { reactive, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AuthCard from '@/components/auth/AuthCard.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import ResetPasswordModal from '@/components/auth/ResetPasswordModal.vue'
import { useAuth } from '@/composables/useAuth'
import { useFormValidation } from '@/composables/useFormValidation'
import { safeRedirect } from '@/router'

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

const form = useTemplateRef('form')
const resetModal = useTemplateRef('resetModal')
const { validated, submitting, formError, resync, onSubmit } = useFormValidation(form)

const credentials = reactive({ email: '', password: '', remember: true })

// После входа возвращаем туда, откуда пришли (?next=/bookings)
const submit = onSubmit(async () => {
  await login(credentials.email, credentials.password)
  router.replace(safeRedirect(route.query.next))
})
</script>

<template>
  <AuthCard>
    <template #aside>
      <h2 class="h3">С возвращением!</h2>
      <p class="mb-4">Ваши брони, избранные рестораны и отзывы ждут в личном кабинете.</p>
    </template>

    <h1 class="h2 mb-1">Вход</h1>
    <p class="text-muted-warm mb-4">Нет аккаунта? <RouterLink :to="{ name: 'register' }">Зарегистрируйтесь</RouterLink></p>

    <form
      ref="form"
      class="needs-validation"
      :class="{ 'was-validated': validated }"
      novalidate
      @submit.prevent="submit"
      @input="resync"
      @change="resync"
    >
      <div class="mb-3">
        <label class="form-label" for="loginEmail">Электронная почта</label>
        <input
          id="loginEmail"
          v-model="credentials.email"
          class="form-control form-control-lg"
          type="email"
          autocomplete="email"
          placeholder="name@example.com"
          required
          aria-errormessage="loginEmailError"
        >
        <div id="loginEmailError" class="invalid-feedback">Введите корректный адрес почты.</div>
      </div>

      <div class="mb-3">
        <div class="d-flex justify-content-between">
          <label class="form-label" for="loginPassword">Пароль</label>
          <a class="small" href="#resetModal" @click.prevent="resetModal.show($event.currentTarget)">Забыли пароль?</a>
        </div>
        <PasswordInput id="loginPassword" v-model="credentials.password" large error="Пароль — не короче 6 символов." />
      </div>

      <div class="form-check mb-4">
        <input id="loginRemember" v-model="credentials.remember" class="form-check-input" type="checkbox">
        <label class="form-check-label" for="loginRemember">Запомнить меня</label>
      </div>

      <div v-if="formError" class="alert alert-danger mb-3" role="alert">{{ formError }}</div>
      <button class="btn btn-primary btn-lg w-100" type="submit" :disabled="submitting">Войти</button>
      <p class="small text-muted-warm mt-3 mb-0">Демо-аккаунт: <code>demo@stolik.ru</code> / <code>stolik2026</code></p>
    </form>

    <ResetPasswordModal ref="resetModal" />
  </AuthCard>
</template>
