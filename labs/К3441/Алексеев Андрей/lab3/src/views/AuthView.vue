<script setup>
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useRequest } from '../composables/useRequest.js';
import { cabinet, useSession } from '../composables/useSession.js';

const props = defineProps({ mode: { type: String, required: true } });
const registration = computed(() => props.mode === 'register');
const router = useRouter();
const { authenticate } = useSession();
const { busy, error, run } = useRequest();
const form = reactive({ name: '', email: '', password: '', role: 'applicant' });

function submit() {
  return run(async () => {
    const name = form.name.trim();
    if (registration.value && !name) throw new Error('Введите имя.');
    const credentials = { email: form.email.trim().toLowerCase(), password: form.password };
    const user = await authenticate(props.mode, registration.value
      ? { ...credentials, name, role: form.role } : credentials);
    await router.push(cabinet(user.role));
  });
}
</script>

<template>
  <section class="panel page-narrow mx-auto p-4 p-md-5">
    <h1 class="h2 mb-4">{{ registration ? 'Регистрация' : 'Вход' }}</h1>
    <form aria-describedby="auth-error" @submit.prevent="submit">
      <template v-if="registration">
        <label class="form-label" for="name">Имя</label>
        <input v-model="form.name" class="form-control mb-3" id="name" autocomplete="name" maxlength="80" required>
      </template>
      <label class="form-label" for="email">Почта</label>
      <input v-model="form.email" class="form-control mb-3" id="email" type="email" autocomplete="email" maxlength="150" required>
      <label class="form-label" for="password">Пароль</label>
      <input v-model="form.password" class="form-control mb-2" id="password" type="password"
        :autocomplete="registration ? 'new-password' : 'current-password'"
        :aria-describedby="registration ? 'password-hint' : undefined"
        :minlength="registration ? 8 : undefined" maxlength="64" required>
      <template v-if="registration">
        <p class="form-text mt-1" id="password-hint">Минимум 8 символов.</p>
        <label class="form-label" for="role">Тип аккаунта</label>
        <select v-model="form.role" class="form-select mb-4" id="role">
          <option value="applicant">Соискатель</option>
          <option value="employer">Работодатель</option>
        </select>
      </template>
      <p class="text-danger" id="auth-error" role="alert">{{ error }}</p>
      <button class="btn btn-primary w-100 mt-2" type="submit" :disabled="busy">
        {{ registration ? 'Создать аккаунт' : 'Войти' }}
      </button>
    </form>
    <p v-if="registration" class="muted mt-4 mb-0">Уже есть аккаунт? <RouterLink :to="{ name: 'login' }">Войти</RouterLink></p>
    <p v-else class="muted mt-4 mb-0">Впервые здесь? <RouterLink :to="{ name: 'register' }">Зарегистрироваться</RouterLink></p>
  </section>
</template>
