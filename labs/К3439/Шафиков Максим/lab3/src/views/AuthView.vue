<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { workoutRoute } from '../router.js';
import { useSession } from '../composables/useSession.js';
import { useAction } from '../composables/useAction.js';

const route = useRoute();
const router = useRouter();
const signup = route.name === 'register';
const workoutId = typeof route.query.workout === 'string' ? route.query.workout : '';
const destination = workoutId ? workoutRoute(workoutId) : { name: 'account' };
const alternate = {
  name: signup ? 'login' : 'register',
  query: workoutId ? { workout: workoutId } : {},
};
const { profile, restoring, authenticate } = useSession();
const { pending, error, run } = useAction();
const nameField = ref(null);
const name = ref('');
const email = ref('');
const password = ref('');
const actionLabel = signup ? 'Зарегистрироваться' : 'Войти';

watch(profile, user => {
  if (user) void router.replace(destination);
}, { immediate: true });

function submit() {
  if (signup && !name.value.trim()) {
    error.value = 'Укажите имя.';
    nameField.value?.focus();
    return;
  }

  const credentials = { email: email.value.trim().toLowerCase(), password: password.value };
  if (signup) credentials.name = name.value.trim();
  return run(() => authenticate(signup ? 'register' : 'login', credentials));
}
</script>

<template>
  <section class="container site-width page-content">
    <p v-if="restoring" class="muted" role="status">Проверка сессии…</p>
    <div v-else-if="!profile" class="auth-panel">
      <h1>{{ signup ? 'Создать аккаунт' : 'Войти' }}</h1>
      <p class="muted">{{ signup ? 'Планируйте занятия и отмечайте выполненные тренировки.' : 'Откройте свой план тренировок и историю занятий.' }}</p>
      <form @submit.prevent="submit">
        <div v-if="signup" class="mb-3">
          <label class="form-label" for="name">Имя</label>
          <input id="name" ref="nameField" v-model="name" class="form-control" autocomplete="given-name" maxlength="50" required>
        </div>
        <div class="mb-3">
          <label class="form-label" for="email">Электронная почта</label>
          <input id="email" v-model="email" class="form-control" type="email" autocomplete="username" maxlength="254" required>
        </div>
        <div class="mb-3">
          <label class="form-label" for="password">Пароль</label>
          <input id="password" v-model="password" class="form-control" type="password" maxlength="128"
            :minlength="signup ? 8 : undefined" :autocomplete="signup ? 'new-password' : 'current-password'"
            :aria-describedby="signup ? 'password-help' : undefined" required>
          <div v-if="signup" id="password-help" class="form-text">Не менее 8 символов</div>
        </div>
        <p class="form-error" role="alert">{{ error }}</p>
        <button class="btn btn-primary w-100" type="submit" :disabled="pending">{{ actionLabel }}</button>
      </form>
      <p class="auth-switch">
        {{ signup ? 'Есть аккаунт?' : 'Впервые здесь?' }}
        <RouterLink :to="alternate">{{ signup ? 'Войти' : 'Зарегистрироваться' }}</RouterLink>
      </p>
      <p class="auth-note">Учебный режим. Используйте тестовые данные. Профиль хранится на учебном сервере.</p>
    </div>
  </section>
</template>
