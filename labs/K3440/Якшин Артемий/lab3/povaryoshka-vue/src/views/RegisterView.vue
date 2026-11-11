<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import AuthSplit from '@/components/AuthSplit.vue'
import BaseLayout from '@/layouts/BaseLayout.vue'
import useAuthStore from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '', password2: '', agree: false })
const validated = ref(false)
const error = ref('')
const pending = ref(false)

// все цвета дают контраст не меньше 4.5:1 с белыми инициалами (см. ДЗ2)
const COLORS = ['#b84a24', '#5e6b3f', '#946616', '#3f5e6b', '#8a4f7d', '#4f6b8a']
const MESSAGES = {
  'Email already exists': 'Пользователь с такой почтой уже зарегистрирован',
  'Password is too short': 'Пароль слишком короткий'
}

const passwordsMatch = computed(() => form.password === form.password2)
const repeatInput = ref(null)

async function submit(event) {
  validated.value = true
  error.value = ''
  // своя проверка совпадения паролей встраивается в стандартную валидацию формы
  repeatInput.value.setCustomValidity(passwordsMatch.value ? '' : 'mismatch')
  if (!event.target.checkValidity()) return

  pending.value = true
  try {
    await auth.register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      city: '',
      bio: '',
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)]
    })
    router.push({ name: 'profile' })
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
      image="/img/recipes/apple-cake.jpg"
      quote="Начните с простого: шарлотка получается у всех с первого раза."
      author="Анна Смирнова, автор 3 рецептов"
    >
      <h1 class="auth__title">Регистрация</h1>
      <p class="text-muted-warm mb-4">Создайте аккаунт, чтобы публиковать свои рецепты.</p>
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
      <form :class="{ 'was-validated': validated }" novalidate @submit.prevent="submit" @input="repeatInput.setCustomValidity(passwordsMatch ? '' : 'mismatch')">
        <div class="mb-3">
          <label class="form-label" for="regName">Имя и фамилия</label>
          <input id="regName" v-model="form.name" class="form-control" type="text" placeholder="Мария Иванова" autocomplete="name" aria-describedby="regNameError" required>
          <div id="regNameError" class="invalid-feedback">Как к вам обращаться?</div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="regEmail">Электронная почта</label>
          <input id="regEmail" v-model="form.email" class="form-control" type="email" placeholder="you@example.com" autocomplete="email" aria-describedby="regEmailError" required>
          <div id="regEmailError" class="invalid-feedback">Введите корректный адрес почты.</div>
        </div>
        <div class="row g-3 mb-3">
          <div class="col-sm-6">
            <label class="form-label" for="regPassword">Пароль</label>
            <input id="regPassword" v-model="form.password" class="form-control" type="password" minlength="6" autocomplete="new-password" aria-describedby="regPasswordError" required>
            <div id="regPasswordError" class="invalid-feedback">Не меньше 6 символов.</div>
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="regPassword2">Повторите пароль</label>
            <input id="regPassword2" ref="repeatInput" v-model="form.password2" class="form-control" type="password" minlength="6" autocomplete="new-password" aria-describedby="regPassword2Error" required>
            <div id="regPassword2Error" class="invalid-feedback">Пароли не совпадают.</div>
          </div>
        </div>
        <div class="form-check mb-4">
          <input id="regAgree" v-model="form.agree" class="form-check-input" type="checkbox" aria-describedby="regAgreeError" required>
          <label class="form-check-label" for="regAgree">Соглашаюсь с правилами сообщества</label>
          <div id="regAgreeError" class="invalid-feedback">Нужно согласие с правилами.</div>
        </div>
        <button class="btn btn-accent w-100 py-2" type="submit" :disabled="pending">Создать аккаунт</button>
      </form>
      <p class="text-center mt-4 mb-0">Уже есть аккаунт? <RouterLink :to="{ name: 'login' }">Войдите</RouterLink></p>
    </AuthSplit>
  </BaseLayout>
</template>
