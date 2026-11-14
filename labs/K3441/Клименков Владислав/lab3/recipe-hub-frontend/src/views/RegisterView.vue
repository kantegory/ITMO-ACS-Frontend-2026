<script setup>
/**
 * RegisterView.vue — регистрация нового пользователя.
 */

import { nextTick, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { isValidEmail } from '@/utils/validation';
import { announce } from '@/composables/useLiveRegion';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirm: '',
  terms: false,
});

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirm: '',
  terms: '',
});

const alertMessage = ref('');
const submitting = ref(false);
const alertBox = ref(null);
const formRef = ref(null);

function validate() {
  errors.name = '';
  errors.email = '';
  errors.password = '';
  errors.confirm = '';
  errors.terms = '';

  if (form.name.trim().length < 2) {
    errors.name = 'Укажите имя (минимум 2 символа).';
  }
  if (!isValidEmail(form.email)) {
    errors.email = 'Введите корректный e-mail.';
  }
  if (form.password.length < 8) {
    errors.password = 'Пароль должен содержать минимум 8 символов.';
  }
  if (!form.confirm || form.confirm !== form.password) {
    errors.confirm = 'Пароли не совпадают.';
  }
  if (!form.terms) {
    errors.terms = 'Необходимо принять правила сервиса.';
  }

  return !Object.values(errors).some(Boolean);
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
    await auth.register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      bio: '',
      subscribers: 0,
    });

    announce('Регистрация завершена');
    await router.replace({ name: 'profile' });
  } catch (error) {
    if (error?.status === 400 && /email/i.test(error.message || '')) {
      errors.email = 'Пользователь с таким e-mail уже существует.';
      alertMessage.value = errors.email;
      await focusFirstInvalid();
    } else if (error?.status === 400) {
      alertMessage.value = 'Проверьте корректность введённых данных.';
    } else if (error?.status === 0) {
      alertMessage.value = error.message;
    } else {
      alertMessage.value =
        'Не удалось зарегистрироваться. Попробуйте ещё раз.';
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
        <div class="col-12 col-md-8 col-lg-6">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h1 class="h3 mb-1" id="register-title">Регистрация</h1>
              <p class="text-muted">
                Создайте аккаунт, чтобы публиковать рецепты и сохранять чужие.
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
                aria-labelledby="register-title"
                novalidate
                :aria-busy="submitting"
                @submit.prevent="submit"
              >
                <div class="mb-3">
                  <label class="form-label" for="reg-name">Имя</label>
                  <input
                    id="reg-name"
                    v-model="form.name"
                    class="form-control"
                    :class="{ 'is-invalid': errors.name }"
                    type="text"
                    name="name"
                    autocomplete="name"
                    aria-describedby="reg-name-error"
                    :aria-invalid="errors.name ? 'true' : 'false'"
                    required
                  >
                  <div class="invalid-feedback" id="reg-name-error">
                    {{ errors.name || 'Укажите имя (минимум 2 символа).' }}
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="reg-email">E-mail</label>
                  <input
                    id="reg-email"
                    v-model="form.email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    type="email"
                    name="email"
                    autocomplete="email"
                    aria-describedby="reg-email-error"
                    :aria-invalid="errors.email ? 'true' : 'false'"
                    required
                  >
                  <div class="invalid-feedback" id="reg-email-error">
                    {{ errors.email || 'Введите корректный e-mail.' }}
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="reg-password">
                    Пароль
                  </label>
                  <input
                    id="reg-password"
                    v-model="form.password"
                    class="form-control"
                    :class="{ 'is-invalid': errors.password }"
                    type="password"
                    name="password"
                    autocomplete="new-password"
                    aria-describedby="reg-password-hint reg-password-error"
                    :aria-invalid="errors.password ? 'true' : 'false'"
                    minlength="8"
                    required
                  >
                  <div class="form-text" id="reg-password-hint">
                    Минимум 8 символов.
                  </div>
                  <div class="invalid-feedback" id="reg-password-error">
                    {{
                      errors.password ||
                      'Пароль должен содержать минимум 8 символов.'
                    }}
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="reg-confirm">
                    Повторите пароль
                  </label>
                  <input
                    id="reg-confirm"
                    v-model="form.confirm"
                    class="form-control"
                    :class="{ 'is-invalid': errors.confirm }"
                    type="password"
                    name="confirm"
                    autocomplete="new-password"
                    aria-describedby="reg-confirm-error"
                    :aria-invalid="errors.confirm ? 'true' : 'false'"
                    required
                  >
                  <div class="invalid-feedback" id="reg-confirm-error">
                    {{ errors.confirm || 'Пароли не совпадают.' }}
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input
                    id="reg-terms"
                    v-model="form.terms"
                    class="form-check-input"
                    :class="{ 'is-invalid': errors.terms }"
                    type="checkbox"
                    name="terms"
                    aria-describedby="reg-terms-error"
                    :aria-invalid="errors.terms ? 'true' : 'false'"
                    required
                  >
                  <label class="form-check-label" for="reg-terms">
                    Я согласен с правилами сервиса
                  </label>
                  <div
                    class="invalid-feedback"
                    id="reg-terms-error"
                  >
                    {{ errors.terms || 'Необходимо принять правила сервиса.' }}
                  </div>
                </div>

                <button
                  class="btn btn-rh-primary w-100"
                  type="submit"
                  :disabled="submitting"
                >
                  {{ submitting ? 'Регистрация…' : 'Зарегистрироваться' }}
                </button>
              </form>

              <hr class="my-4">
              <p class="mb-0">
                Уже есть аккаунт?
                <RouterLink to="/login">Войдите</RouterLink>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

