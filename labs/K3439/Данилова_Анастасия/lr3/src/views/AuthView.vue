<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useRequest } from '../composables/useRequest'

const props = defineProps({ registration: Boolean })
const fields = reactive({ email: '', password: '', firstName: '', lastName: '', role: 'TENANT' })
const router = useRouter()
const { authenticate } = useAuth()
const { pending, error, run } = useRequest()

function submit() {
  return run(async () => {
    const { email, password } = fields
    const payload = props.registration
      ? { ...fields, avatar: 'https://i.pravatar.cc/150?u=' + encodeURIComponent(email) }
      : { email, password }
    await authenticate(props.registration ? '/register' : '/login', payload)
    await router.push({ name: 'profile' })
  })
}
</script>

<template>
  <div class="auth-box">
    <h1 class="h3">{{ registration ? 'Регистрация' : 'Вход' }}</h1>
    <form class="d-grid gap-2" @submit.prevent="submit">
      <template v-if="registration">
        <label for="firstName">Имя</label>
        <input id="firstName" v-model.trim="fields.firstName" autocomplete="given-name" class="form-control" required>
        <label for="lastName">Фамилия</label>
        <input id="lastName" v-model.trim="fields.lastName" autocomplete="family-name" class="form-control" required>
      </template>
      <label for="email">Email</label>
      <input id="email" v-model.trim="fields.email" type="email" autocomplete="email" class="form-control" required>
      <label for="password">Пароль</label>
      <input id="password" v-model="fields.password" type="password" :autocomplete="registration ? 'new-password' : 'current-password'"
             :minlength="registration ? 6 : undefined" class="form-control" required>
      <template v-if="registration">
        <label for="role">Я хочу</label>
        <select id="role" v-model="fields.role" class="form-select">
          <option value="TENANT">Снимать жильё</option>
          <option value="LANDLORD">Сдавать жильё</option>
        </select>
      </template>
      <p v-if="error" role="alert" class="alert alert-danger">{{ error }}</p>
      <button class="btn btn-primary mt-2" :disabled="pending">{{ registration ? 'Создать аккаунт' : 'Войти' }}</button>
    </form>
    <RouterLink class="d-inline-block mt-3" :to="registration ? '/login' : '/register'">
      {{ registration ? 'Войти с существующим аккаунтом' : 'Зарегистрироваться' }}
    </RouterLink>
  </div>
</template>
