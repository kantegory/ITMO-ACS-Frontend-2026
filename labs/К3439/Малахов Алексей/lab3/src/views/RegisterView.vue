<template>
  <base-layout>
    <div class="auth-card panel">
      <h1 class="h3 mb-1">Регистрация</h1>
      <p class="text-muted">Создайте аккаунт, чтобы публиковать свои рецепты.</p>
      <div
        v-if="serverError"
        ref="alert"
        class="alert alert-danger"
        role="alert"
        tabindex="-1"
      >
        {{ serverError }}
      </div>
      <form
        ref="form"
        novalidate
        :class="{ 'was-validated': validated }"
        @input="onInput"
        @submit.prevent="submit"
      >
        <div class="mb-3">
          <label for="name" class="form-label">Имя</label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="form-control"
            autocomplete="name"
            required
            minlength="2"
            aria-describedby="nameError"
          />
          <div id="nameError" class="invalid-feedback">Введите имя.</div>
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-control"
            autocomplete="email"
            required
            aria-describedby="emailError"
          />
          <div id="emailError" class="invalid-feedback">Введите корректный email.</div>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-control"
            autocomplete="new-password"
            required
            minlength="6"
            aria-describedby="passwordHelp passwordError"
          />
          <div id="passwordHelp" class="form-text">Минимум 6 символов.</div>
          <div id="passwordError" class="invalid-feedback">
            Пароль слишком короткий.
          </div>
        </div>
        <div class="mb-3">
          <label for="passwordRepeat" class="form-label">Повторите пароль</label>
          <input
            id="passwordRepeat"
            ref="repeatInput"
            v-model="passwordRepeat"
            type="password"
            class="form-control"
            autocomplete="new-password"
            required
            data-no-trim
            aria-describedby="passwordRepeatError"
          />
          <div id="passwordRepeatError" class="invalid-feedback">
            Пароли не совпадают.
          </div>
        </div>
        <div class="form-check mb-3">
          <input
            id="agree"
            v-model="agree"
            class="form-check-input"
            type="checkbox"
            required
            aria-describedby="agreeError"
          />
          <label class="form-check-label" for="agree"
            >Согласен с правилами сервиса</label
          >
          <div id="agreeError" class="invalid-feedback">
            Нужно согласие с правилами.
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="sending">
          Создать аккаунт
        </button>
      </form>
      <p class="text-center mt-3 mb-0">
        Уже есть аккаунт?
        <router-link :to="{ name: 'login', query: route.query }">Войти</router-link>
      </p>
    </div>
  </base-layout>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useFormValidation } from '@/composables/useFormValidation'
import BaseLayout from '@/layouts/BaseLayout.vue'
import useAuthStore from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const form = ref(null)
const alert = ref(null)
const repeatInput = ref(null)
const name = ref('')
const email = ref('')
const password = ref('')
const passwordRepeat = ref('')
const agree = ref(false)
const sending = ref(false)
const serverError = ref('')
const { validated, validate, onInput } = useFormValidation(form)

watch([password, passwordRepeat], () => {
  repeatInput.value?.setCustomValidity(
    password.value === passwordRepeat.value ? '' : 'mismatch',
  )
})

async function submit() {
  repeatInput.value.setCustomValidity(
    password.value === passwordRepeat.value ? '' : 'mismatch',
  )
  if (!validate()) return
  sending.value = true
  serverError.value = ''
  try {
    await auth.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
    })
    const redirect = route.query.redirect
    const safe =
      typeof redirect === 'string' &&
      redirect.startsWith('/') &&
      !redirect.startsWith('//')
    router.replace(safe ? redirect : { name: 'profile' })
  } catch (error) {
    serverError.value = error.message
    await nextTick()
    alert.value?.focus()
  } finally {
    sending.value = false
  }
}
</script>
