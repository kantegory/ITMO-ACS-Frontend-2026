<script setup>
import { reactive, ref, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useApi } from '../composables/useApi';
import { useAuth } from '../composables/useAuth';
const props = defineProps({ mode: { type: String, required: true } });
const route = useRoute(), router = useRouter(), { api, message } = useApi(), auth = useAuth();
const form = reactive({ name: '', email: '', password: '' });
const error = ref(''), sending = ref(false);
watch(() => props.mode, () => { error.value = ''; form.password = ''; });
async function submit() {
  error.value = ''; sending.value = true;
  try {
    const path = props.mode === 'register' ? '/auth/register' : '/auth/login';
    const payload = props.mode === 'register' ? form : { email: form.email, password: form.password };
    const { data } = await api.post(path, payload);
    auth.setSession(data);
    router.push(typeof route.query.next === 'string' && route.query.next.startsWith('/') ? route.query.next : '/profile');
  } catch (e) { error.value = message(e); }
  finally { sending.value = false; }
}
</script>
<template>
  <div class="auth-wrap surface p-4 p-md-5">
    <p class="eyebrow">{{ mode === 'register' ? 'Присоединяйтесь' : 'С возвращением' }}</p>
    <h1 class="page-title h2">{{ mode === 'register' ? 'Создайте аккаунт' : 'Войдите в аккаунт' }}</h1>
    <p class="meta">Бронирования будут доступны в личном кабинете.</p>
    <form @submit.prevent="submit">
      <div v-if="mode === 'register'" class="mb-3"><label class="form-label" for="name">Имя</label><input id="name" v-model.trim="form.name" class="form-control" autocomplete="name" required></div>
      <div class="mb-3"><label class="form-label" for="email">Электронная почта</label><input id="email" v-model.trim="form.email" class="form-control" type="email" autocomplete="email" required></div>
      <div class="mb-3"><label class="form-label" for="password">Пароль {{ mode === 'register' ? '(от 8 символов)' : '' }}</label><input id="password" v-model="form.password" class="form-control" type="password" :autocomplete="mode === 'register' ? 'new-password' : 'current-password'" :minlength="mode === 'register' ? 8 : undefined" required></div>
      <p v-if="error" class="alert alert-danger" role="alert">{{ error }}</p>
      <button class="btn btn-primary w-100" type="submit" :disabled="sending">{{ sending ? 'Подождите…' : mode === 'register' ? 'Создать аккаунт' : 'Войти' }}</button>
    </form>
    <p class="mt-4 mb-0" v-if="mode === 'register'">Уже есть аккаунт? <RouterLink to="/login">Войти</RouterLink></p>
    <p class="mt-4 mb-0" v-else>Нет аккаунта? <RouterLink to="/register">Зарегистрироваться</RouterLink></p>
  </div>
</template>
