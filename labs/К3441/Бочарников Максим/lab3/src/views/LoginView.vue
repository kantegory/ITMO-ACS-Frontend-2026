<template>
  <div class="auth-wrap">
    <div class="container">
      <section class="auth-card" aria-labelledby="login-title">
        <h1 id="login-title">
          <Icon name="user" />
          Вход
        </h1>
        <p class="text-muted mb-3">Введи данные и заходи в свой кабинет.</p>
        <p class="small text-muted mb-3">
          Демо: <code>max@vice.bites</code> / <code>password123</code>
        </p>

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
            <label class="form-label" for="login-email">Email</label>
            <input
              id="login-email"
              v-model="email"
              class="form-control"
              type="email"
              required
              autocomplete="email"
              placeholder="max@vice.bites"
              aria-required="true"
            >
          </div>
          <div class="mb-3">
            <label class="form-label" for="login-password">Пароль</label>
            <input
              id="login-password"
              v-model="password"
              class="form-control"
              type="password"
              required
              autocomplete="current-password"
              minlength="6"
              placeholder="password123"
              aria-required="true"
            >
          </div>
          <button type="submit" class="btn btn-vice btn-vice-primary w-100" :disabled="busy">
            Войти
          </button>
        </form>

        <p class="auth-alt">
          Нет аккаунта?
          <RouterLink to="/register">Зарегистрироваться</RouterLink>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import { useAuth } from '@/composables/useAuth'

const { login } = useAuth()
const router = useRouter()
const route = useRoute()

const email = ref('max@vice.bites')
const password = ref('password123')
const alert = ref('')
const busy = ref(false)

async function onSubmit() {
  alert.value = ''
  busy.value = true
  try {
    await login(email.value.trim(), password.value)
    const redirect = route.query.redirect || '/profile'
    router.push(String(redirect))
  } catch (err) {
    alert.value =
      err.status === 400
        ? 'Неверный email или пароль.'
        : err.message || 'Ошибка входа. Запущен ли API на :3000?'
  } finally {
    busy.value = false
  }
}
</script>
