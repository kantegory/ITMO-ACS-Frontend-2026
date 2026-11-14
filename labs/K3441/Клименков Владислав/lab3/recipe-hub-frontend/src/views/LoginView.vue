<script setup>
/**
 * LoginView.vue — вход в аккаунт.
 *
 * После успешного входа пользователь возвращается на защищённую страницу
 * (query.redirect) или попадает в личный кабинет.
 */

import { nextTick, reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { isValidEmail } from '@/utils/validation';
import { announce } from '@/composables/useLiveRegion';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const form = reactive({
  email: '',
  password: '',
  remember: false,
});

const errors = reactive({
  email: '',
  password: '',
});

const alertMessage = ref('');
const submitting = ref(false);
const alertBox = ref(null);
const formRef = ref(null);

function validate() {
  errors.email = '';
  errors.password = '';

  if (!isValidEmail(form.email)) {
    errors.email = 'Введите корректный e-mail.';
  }
  if (!form.password) {
    errors.password = 'Введите пароль.';
  }

  return !errors.email && !errors.password;
}

async function focusFirstInvalid() {
  await nextTick();
  formRef.value?.querySelector('.is-invalid')?.focus();
}

async function submit() {
  alertMessage.value = '';

  if (!validate()) {
    await focusFirstInvalid();
    return;
  }

  submitting.value = true;

  try {
    await auth.login(form.email.trim(), form.password, form.remember);
    announce('Вы вошли в аккаунт');

    const redirect =
      typeof route.query.redirect === 'string' &&
      route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/profile';

    await router.replace(redirect);
  } catch (error) {
    if (error?.status === 400) {
      alertMessage.value = 'Неверный e-mail или пароль.';
    } else if (error?.status === 0) {
      alertMessage.value = error.message;
    } else {
      alertMessage.value = 'Не удалось войти. Попробуйте ещё раз.';
    }

    await nextTick();
    alertBox.value?.focus();
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main id="main-content" class="rh-page py-5" tabindex="-1">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-5">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h1 class="h3 mb-1" id="login-title">Вход в аккаунт</h1>
              <p class="text-muted">
                Войдите, чтобы публиковать рецепты и сохранять чужие.
              </p>

              <div
                v-if="alertMessage"
                ref="alertBox"
                class="alert alert-danger"
                role="alert"
                tabindex="-1"
              >
                {{ alertMessage }}
              </div>

              <form
                ref="formRef"
                aria-labelledby="login-title"
                novalidate
                :aria-busy="submitting"
                @submit.prevent="submit"
              >
                <div class="mb-3">
                  <label class="form-label" for="login-email">E-mail</label>
                  <input
                    id="login-email"
                    v-model="form.email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    type="email"
                    name="email"
                    autocomplete="email"
                    aria-describedby="login-email-error"
                    :aria-invalid="errors.email ? 'true' : 'false'"
                    required
                  >
                  <div class="invalid-feedback" id="login-email-error">
                    {{ errors.email || 'Введите корректный e-mail.' }}
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="login-password">
                    Пароль
                  </label>
                  <input
                    id="login-password"
                    v-model="form.password"
                    class="form-control"
                    :class="{ 'is-invalid': errors.password }"
                    type="password"
                    name="password"
                    autocomplete="current-password"
                    aria-describedby="login-password-error"
                    :aria-invalid="errors.password ? 'true' : 'false'"
                    required
                  >
                  <div class="invalid-feedback" id="login-password-error">
                    {{ errors.password || 'Введите пароль.' }}
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input
                    id="login-remember"
                    v-model="form.remember"
                    class="form-check-input"
                    type="checkbox"
                    name="remember"
                  >
                  <label class="form-check-label" for="login-remember">
                    Запомнить меня
                  </label>
                </div>

                <button
                  class="btn btn-rh-primary w-100"
                  type="submit"
                  :disabled="submitting"
                >
                  {{ submitting ? 'Вход…' : 'Войти' }}
                </button>
              </form>

              <hr class="my-4">

              <p class="text-muted small mb-2">
                Демо-доступ: <code>demo@recipehub.ru</code> /
                <code>demo1234</code>
              </p>
              <p class="mb-0">
                Нет аккаунта?
                <RouterLink to="/register">Зарегистрируйтесь</RouterLink>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

