<template>
  <div class="auth-wrap">
    <div class="container">
      <section class="auth-card" aria-labelledby="reg-title">
        <h1 id="reg-title">Регистрация</h1>
        <p class="text-muted mb-3">Создай аккаунт и делись рецептами.</p>

        <div
          v-if="alert"
          class="alert alert-danger"
          role="alert"
          aria-live="assertive"
        >
          {{ alert }}
        </div>

        <form novalidate @submit.prevent="onSubmit">
          <div class="mb-3">
            <label class="form-label" for="reg-name">Имя</label>
            <input
              id="reg-name"
              v-model="name"
              class="form-control"
              type="text"
              required
              autocomplete="name"
              aria-required="true"
            >
          </div>
          <div class="mb-3">
            <label class="form-label" for="reg-email">Email</label>
            <input
              id="reg-email"
              v-model="email"
              class="form-control"
              type="email"
              required
              autocomplete="email"
              aria-required="true"
            >
          </div>
          <div class="mb-3">
            <label class="form-label" for="reg-password">Пароль</label>
            <input
              id="reg-password"
              v-model="password"
              class="form-control"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
              aria-required="true"
            >
          </div>
          <div class="mb-4">
            <label class="form-label" for="reg-password2">Повтор пароля</label>
            <input
              id="reg-password2"
              v-model="password2"
              class="form-control"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
              aria-required="true"
            >
          </div>
          <button type="submit" class="btn btn-vice btn-vice-primary w-100" :disabled="busy">
            Создать аккаунт
          </button>
        </form>

        <p class="auth-alt">
          Уже есть аккаунт?
          <RouterLink to="/login">Войти</RouterLink>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { register } = useAuth()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const password2 = ref('')
const alert = ref('')
const busy = ref(false)

async function onSubmit() {
  alert.value = ''
  if (password.value !== password2.value) {
    alert.value = 'Пароли не совпадают.'
    return
  }

  busy.value = true
  try {
    await register({
      email: email.value.trim(),
      password: password.value,
      name: name.value.trim(),
      handle:
        '@' +
        (name.value.trim() || 'chef').toLowerCase().replace(/\s+/g, '_'),
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop',
      bio: 'Новый кулинар VICE BITES',
    })
    router.push('/profile')
  } catch (err) {
    alert.value =
      err.status === 400
        ? 'Email уже занят или данные некорректны.'
        : err.message || 'Ошибка регистрации. Запущен ли API на :3000?'
  } finally {
    busy.value = false
  }
}
</script>
