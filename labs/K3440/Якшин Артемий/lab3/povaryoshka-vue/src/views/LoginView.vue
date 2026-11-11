<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AuthSplit from '@/components/AuthSplit.vue'
import BaseLayout from '@/layouts/BaseLayout.vue'
import useAuthStore from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const validated = ref(false)
const error = ref('')
const pending = ref(false)

const MESSAGES = {
  'Cannot find user': 'Пользователь с такой почтой не найден',
  'Incorrect password': 'Неверный пароль'
}

async function submit(event) {
  validated.value = true
  error.value = ''
  if (!event.target.checkValidity()) return

  pending.value = true
  try {
    await auth.login(form.email.trim(), form.password)
    // после входа возвращаемся туда, откуда пришли (только внутри сайта)
    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : { name: 'profile' })
  } catch (err) {
    const message = err.response?.data
    error.value = err.response ? (MESSAGES[message] ?? message) : 'Сервер не отвечает. Запустите API командой npm run api.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <BaseLayout flush>
    <AuthSplit
      image="/img/recipes/pumpkin-soup.jpg"
      quote="Лучшие рецепты — те, которыми делятся за семейным столом."
      author="Михаил Орлов, автор 3 рецептов"
    >
      <h1 class="auth__title">С возвращением!</h1>
      <p class="text-muted-warm mb-4">Войдите, чтобы сохранять рецепты и подписываться на кулинаров.</p>
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
      <form :class="{ 'was-validated': validated }" novalidate @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label" for="loginEmail">Электронная почта</label>
          <input id="loginEmail" v-model="form.email" class="form-control" type="email" placeholder="you@example.com" autocomplete="email" aria-describedby="loginEmailError" required>
          <div id="loginEmailError" class="invalid-feedback">Введите корректный адрес почты.</div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="loginPassword">Пароль</label>
          <input id="loginPassword" v-model="form.password" class="form-control" type="password" minlength="6" autocomplete="current-password" aria-describedby="loginPasswordError" required>
          <div id="loginPasswordError" class="invalid-feedback">Пароль — не меньше 6 символов.</div>
        </div>
        <button class="btn btn-accent w-100 py-2 mt-2" type="submit" :disabled="pending">Войти</button>
      </form>
      <p class="small text-muted-warm text-center mt-3 mb-0">Демо-аккаунт: <code>demo@povaryoshka.ru</code> / <code>povar2026</code></p>
      <p class="text-center mt-3 mb-0">Нет аккаунта? <RouterLink :to="{ name: 'register' }">Зарегистрируйтесь</RouterLink></p>
    </AuthSplit>
  </BaseLayout>
</template>
