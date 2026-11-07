<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthShell from '@/components/auth/AuthShell.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import BaseModal from '@/components/BaseModal.vue'
import registerHero from '@/assets/register-hero.png'
import { registerUser } from '@/api/authApi'
import { useToast } from '@/composables/useToast'

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmation: '',
  terms: false,
})
const error = ref('')
const pending = ref(false)
const successOpen = ref(false)
const router = useRouter()
const { showToast } = useToast()

async function submit() {
  error.value = ''
  if (form.password !== form.confirmation) {
    error.value = 'Пароли не совпадают.'
    return
  }
  if (!/^8\d{10}$/.test(form.phone)) {
    error.value = 'Телефон должен быть в формате 89134123432.'
    return
  }
  if (!form.terms) {
    error.value = 'Примите условия использования сервиса.'
    return
  }
  pending.value = true
  try {
    await registerUser({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone,
      password: form.password,
    })
    successOpen.value = true
  } catch (requestError) {
    showToast(
      requestError.response?.status === 400
        ? 'Пользователь с такой почтой уже существует'
        : 'Не удалось создать аккаунт',
    )
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <AuthShell :image="registerHero">
    <h2>Регистрация</h2>
    <p class="rs-muted">Создайте аккаунт, чтобы найти жильё и общаться с владельцами</p>
    <form class="stack-form" @submit.prevent="submit">
      <div class="form-field">
        <label class="form-label" for="register-name">Имя пользователя</label
        ><input
          id="register-name"
          v-model.trim="form.name"
          class="form-control"
          maxlength="50"
          required
        />
      </div>
      <div class="form-field">
        <label class="form-label" for="register-email">Электронная почта</label
        ><input
          id="register-email"
          v-model.trim="form.email"
          class="form-control"
          type="email"
          required
        />
      </div>
      <div class="form-field">
        <label class="form-label" for="register-phone">Телефон</label
        ><input
          id="register-phone"
          v-model="form.phone"
          class="form-control"
          type="tel"
          pattern="8[0-9]{10}"
          placeholder="89134123432"
          required
        />
      </div>
      <PasswordField id="register-password" v-model="form.password" autocomplete="new-password" />
      <PasswordField
        id="repeat-password"
        v-model="form.confirmation"
        label="Повторите пароль"
        autocomplete="new-password"
        :error="error"
      />
      <label class="form-check"
        ><input v-model="form.terms" class="form-check-input" type="checkbox" required />
        <span>Я принимаю условия использования сервиса</span></label
      >
      <button class="btn btn-primary w-100" type="submit" :disabled="pending">
        {{ pending ? 'Создаём…' : 'Создать аккаунт' }}
      </button>
    </form>
    <p class="text-center mt-3 rs-muted">
      Уже есть аккаунт?
      <RouterLink class="text-primary fw-semibold" :to="{ name: 'login' }">Войти</RouterLink>
    </p>
  </AuthShell>
  <BaseModal v-model="successOpen" labelledby="register-success-title">
    <template #title><h2 id="register-success-title" class="h4 m-0">Аккаунт создан</h2></template>
    <p class="m-0">Теперь вы можете перейти на страницу входа.</p>
    <template #footer
      ><button class="btn btn-primary" @click="router.push({ name: 'login' })">
        Перейти ко входу
      </button></template
    >
  </BaseModal>
</template>
