<template>
  <base-layout>
    <div class="auth-card panel">
      <h1 class="h3 mb-1">Вход</h1>
      <p class="text-muted">
        Войдите, чтобы сохранять рецепты и подписываться на кулинаров.
      </p>
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
            autocomplete="current-password"
            required
            minlength="6"
            aria-describedby="passwordError"
          />
          <div id="passwordError" class="invalid-feedback">
            Пароль не короче 6 символов.
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="sending">
          Войти
        </button>
      </form>
      <p class="form-text mt-3 mb-0">
        Демо-аккаунт: alex@example.com, пароль recipe123
      </p>
      <p class="text-center mt-3 mb-0">
        Нет аккаунта?
        <router-link :to="{ name: 'register', query: route.query }"
          >Зарегистрируйтесь</router-link
        >
      </p>
    </div>
  </base-layout>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useFormValidation } from '@/composables/useFormValidation'
import BaseLayout from '@/layouts/BaseLayout.vue'
import useAuthStore from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const form = ref(null)
const alert = ref(null)
const email = ref('')
const password = ref('')
const sending = ref(false)
const serverError = ref('')
const { validated, validate, onInput } = useFormValidation(form)

async function submit() {
  if (!validate()) return
  sending.value = true
  serverError.value = ''
  try {
    await auth.login(email.value.trim(), password.value)
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
