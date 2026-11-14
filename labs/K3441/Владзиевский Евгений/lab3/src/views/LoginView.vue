<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import { useAuth } from '../composables/useAuth.js';

const route = useRoute();
const router = useRouter();
const { login } = useAuth();

const form = reactive({ email: '', password: '', remember: true });
const errors = reactive({ email: '', password: '' });
const commonError = ref('');
const pending = ref(false);
const showPassword = ref(false);

function validate() {
  errors.email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) ? '' : 'Введите почту в формате name@mail.ru';
  errors.password = form.password.length >= 6 ? '' : 'Пароль не короче 6 символов';
  return !errors.email && !errors.password;
}

// Возвращаем туда, откуда попросили авторизоваться
function goNext() {
  const next = route.query.next;
  const safe = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/profile';
  router.replace(safe);
}

async function submit(credentials = form) {
  if (credentials === form && !validate()) return;
  pending.value = true;
  commonError.value = '';
  try {
    await login(credentials.email.trim().toLowerCase(), credentials.password);
    goNext();
  } catch (error) {
    commonError.value = error.status === 400
      ? 'Неверная почта или пароль. Проверьте раскладку и попробуйте ещё раз.'
      : error.message;
  } finally {
    pending.value = false;
  }
}

const loginAsDemo = () => submit({ email: 'demo@klyuchi.ru', password: 'demo1234' });
</script>

<template>
  <div class="auth-wrap">
    <div class="auth-aside" style="background-image: url('/img/flat-5.webp')">
      <blockquote>
        Нашли двушку на Московском за два дня. Владелец ответил в чате через десять минут,
        договор подписали прямо на просмотре.
        <cite>Анна и Михаил, снимают с марта 2026</cite>
      </blockquote>
    </div>

    <div class="auth-form-col">
      <div class="auth-card">
        <h1 class="mb-2">Вход</h1>
        <p class="text-muted-2 mb-4">
          Нет аккаунта? <RouterLink :to="{ name: 'register' }">Зарегистрируйтесь</RouterLink>, это займёт минуту.
        </p>

        <div v-if="commonError" class="alert alert-danger" role="alert">{{ commonError }}</div>

        <form novalidate @submit.prevent="submit()">
          <div class="mb-3">
            <label class="form-label" for="login-email">Электронная почта</label>
            <input
              id="login-email"
              v-model.trim="form.email"
              class="form-control form-control-lg"
              :class="{ 'is-invalid': errors.email }"
              type="email"
              autocomplete="email"
              placeholder="name@mail.ru"
              :aria-invalid="Boolean(errors.email)"
              aria-describedby="login-email-error"
            >
            <div v-if="errors.email" id="login-email-error" class="invalid-feedback d-block">{{ errors.email }}</div>
          </div>

          <div class="mb-2">
            <label class="form-label" for="login-password">Пароль</label>
            <div class="input-group input-group-lg">
              <input
                id="login-password"
                v-model="form.password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                :aria-invalid="Boolean(errors.password)"
                aria-describedby="login-password-error"
              >
              <button
                class="btn btn-outline-secondary"
                type="button"
                :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
                @click="showPassword = !showPassword"
              >
                <AppIcon :name="showPassword ? 'eye-slash' : 'eye'" />
              </button>
            </div>
            <div v-if="errors.password" id="login-password-error" class="invalid-feedback d-block">{{ errors.password }}</div>
          </div>

          <div class="d-flex justify-content-between align-items-center my-4">
            <div class="form-check">
              <input id="login-remember" v-model="form.remember" class="form-check-input" type="checkbox">
              <label class="form-check-label" for="login-remember">Запомнить меня</label>
            </div>
          </div>

          <button class="btn btn-primary btn-lg w-100" type="submit" :disabled="pending">
            <span v-if="pending" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            {{ pending ? 'Входим…' : 'Войти' }}
          </button>
        </form>

        <div class="d-flex align-items-center gap-3 my-4 text-muted-2 small">
          <hr class="flex-grow-1 m-0"><span>или</span><hr class="flex-grow-1 m-0">
        </div>

        <div class="d-grid gap-2">
          <button class="btn btn-outline-secondary btn-lg" type="button" :disabled="pending" @click="loginAsDemo">
            <AppIcon name="key-fill" class="me-2" />Войти тестовым пользователем
          </button>
        </div>

        <p class="small text-muted-2 mt-3 mb-0">
          В базе есть готовый аккаунт: <code>demo@klyuchi.ru</code> / <code>demo1234</code>.
        </p>
      </div>
    </div>
  </div>
</template>
