<script setup>
import { computed, reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useRequest } from '../composables/useRequest.js';
import { useSessionStore } from '../stores/session.js';

const router = useRouter();
const route = useRoute();
const session = useSessionStore();
const register = computed(() => route.name === 'register');
const form = reactive({ name: '', email: '', password: '' });
const alert = ref(null);
const { pending, failure, run } = useRequest();

function afterAuthTarget(next) {
  return typeof next === 'string' && /^(?:\/(?:account|history|restaurants\/\d+)?)(?:\?[^#]*)?$/.test(next)
    ? next : '/account';
}

async function submit() {
  const mode = register.value ? 'register' : 'login';
  const done = await run(() => session.authenticate(mode, { ...form }), () => router.replace(afterAuthTarget(route.query.next)));
  if (!done) alert.value?.focus();
}
</script>

<template>
  <section class="auth-panel panel">
    <RouterLink class="back-link" to="/">К ресторанам</RouterLink>
    <h1>{{ register ? 'Создать аккаунт' : 'Войти в аккаунт' }}</h1>
    <p class="muted">Управляйте бронированиями в личном кабинете.</p>
    <form class="form-stack" @submit.prevent="submit">
      <template v-if="register">
        <label class="form-label" for="name">Ваше имя</label>
        <input id="name" v-model.trim="form.name" class="form-control" autocomplete="name" maxlength="80" required>
      </template>
      <label class="form-label" for="email">Электронная почта</label>
      <input id="email" v-model.trim="form.email" class="form-control" type="email" autocomplete="email" required>
      <label class="form-label" for="password">Пароль</label>
      <input id="password" v-model="form.password" class="form-control" type="password"
             :autocomplete="register ? 'new-password' : 'current-password'" :minlength="register ? 8 : undefined"
             :aria-describedby="register ? 'password-hint' : undefined" maxlength="64" required>
      <small v-if="register" id="password-hint" class="muted">От 8 до 64 символов.</small>
      <p v-if="failure" ref="alert" role="alert" tabindex="-1" class="error-text mb-0">{{ failure }}</p>
      <button type="submit" class="btn btn-primary" :disabled="pending">{{ register ? 'Зарегистрироваться' : 'Войти' }}</button>
    </form>
    <p v-if="register" class="mt-4 mb-0">Уже есть аккаунт? <RouterLink :to="{ name: 'login', query: route.query }">Войти</RouterLink></p>
    <p v-else class="mt-4 mb-0">Впервые на «Столике»? <RouterLink :to="{ name: 'register', query: route.query }">Зарегистрироваться</RouterLink></p>
  </section>
</template>
