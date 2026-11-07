<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthShell from '@/components/auth/AuthShell.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import loginHero from '@/assets/login-hero.png'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const email = ref('')
const password = ref('')
const error = ref('')
const pending = ref(false)
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { showToast } = useToast()

async function submit() {
  error.value = ''
  if (!email.value || password.value.length < 8) {
    error.value = 'Заполните email и пароль длиной не менее 8 символов.'
    return
  }
  pending.value = true
  try {
    await auth.login({ email: email.value.trim(), password: password.value })
    await router.push(
      typeof route.query.redirect === 'string' ? route.query.redirect : { name: 'search' },
    )
  } catch (requestError) {
    if ([400, 401].includes(requestError.response?.status))
      error.value = 'Неверная электронная почта или пароль.'
    else showToast('Не удалось подключиться к серверу')
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <AuthShell :image="loginHero">
    <h2>Вход</h2>
    <p class="rs-muted">Войдите, чтобы управлять арендой и сообщениями</p>
    <form class="stack-form" @submit.prevent="submit">
      <div class="form-field">
        <label class="form-label" for="login-email">Электронная почта</label
        ><input
          id="login-email"
          v-model="email"
          class="form-control"
          type="email"
          autocomplete="email"
          placeholder="name@example.ru"
          required
        />
      </div>
      <PasswordField id="login-password" v-model="password" :error="error" />
      <label class="form-check"
        ><input class="form-check-input" type="checkbox" /> <span>Запомнить меня</span></label
      >
      <button class="btn btn-primary w-100" type="submit" :disabled="pending">
        {{ pending ? 'Входим…' : 'Войти' }}
      </button>
    </form>
    <p class="text-center mt-4 rs-muted">
      Нет аккаунта?
      <RouterLink class="text-primary fw-semibold" :to="{ name: 'register' }"
        >Зарегистрироваться</RouterLink
      >
    </p>
  </AuthShell>
</template>
