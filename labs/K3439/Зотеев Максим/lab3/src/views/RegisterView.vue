<script setup>
import { nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import AlertBanner from '@/components/common/AlertBanner.vue'
import { useAuthStore } from '@/stores/auth'
import { useAsyncState } from '@/composables/useAsyncState'

const auth = useAuthStore()
const router = useRouter()
const { loading, error, clearError, run } = useAsyncState()

const emailRef = ref(null)
const emailInvalid = ref(false)
const validationError = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'tenant',
  agree: false,
})

function resetErrors() {
  clearError()
  validationError.value = ''
  emailInvalid.value = false
}

async function handleSubmit() {
  if (loading.value) return
  resetErrors()

  if (!form.firstName || !form.lastName || !form.email || !form.phone) {
    validationError.value = 'Заполните все обязательные поля.'
    return
  }

  try {
    await run(() =>
      auth.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      }),
    )
    router.replace({ name: 'profile' })
  } catch {
    emailInvalid.value = true
    await nextTick()
    emailRef.value?.focus()
  }
}
</script>

<template>
  <AppLayout main-class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-5">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h1 class="h3 mb-4 text-center">Регистрация</h1>
            <AlertBanner :message="validationError || error" type="danger" />
            <p class="text-muted small">Все поля обязательны для заполнения.</p>

            <form @submit.prevent="handleSubmit" @input="resetErrors">
              <fieldset :disabled="loading">
                <div class="row">
                  <div class="col-sm-6 mb-3">
                    <label for="reg-firstName" class="form-label">Имя</label>
                    <input
                      id="reg-firstName"
                      v-model.trim="form.firstName"
                      type="text"
                      class="form-control"
                      autocomplete="given-name"
                      required
                    >
                  </div>
                  <div class="col-sm-6 mb-3">
                    <label for="reg-lastName" class="form-label">Фамилия</label>
                    <input
                      id="reg-lastName"
                      v-model.trim="form.lastName"
                      type="text"
                      class="form-control"
                      autocomplete="family-name"
                      required
                    >
                  </div>
                </div>

                <div class="mb-3">
                  <label for="reg-email" class="form-label">Email</label>
                  <input
                    id="reg-email"
                    ref="emailRef"
                    v-model.trim="form.email"
                    type="email"
                    :class="['form-control', { 'is-invalid': emailInvalid }]"
                    :aria-invalid="emailInvalid ? 'true' : undefined"
                    placeholder="name@example.com"
                    autocomplete="email"
                    required
                  >
                </div>

                <div class="mb-3">
                  <label for="reg-phone" class="form-label">Телефон</label>
                  <input
                    id="reg-phone"
                    v-model.trim="form.phone"
                    type="tel"
                    class="form-control"
                    placeholder="+7 900 000-00-00"
                    autocomplete="tel"
                    required
                  >
                </div>

                <div class="mb-3">
                  <label for="reg-password" class="form-label">Пароль</label>
                  <input
                    id="reg-password"
                    v-model="form.password"
                    type="password"
                    class="form-control"
                    minlength="6"
                    autocomplete="new-password"
                    aria-describedby="passwordHelp"
                    required
                  >
                  <div id="passwordHelp" class="form-text">Не менее 6 символов</div>
                </div>

                <fieldset class="mb-3">
                  <legend class="form-label fs-6 mb-1">Я хочу</legend>
                  <div class="form-check form-check-inline">
                    <input
                      id="role-tenant"
                      v-model="form.role"
                      class="form-check-input"
                      type="radio"
                      name="role"
                      value="tenant"
                    >
                    <label class="form-check-label" for="role-tenant">снять жильё</label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input
                      id="role-owner"
                      v-model="form.role"
                      class="form-check-input"
                      type="radio"
                      name="role"
                      value="owner"
                    >
                    <label class="form-check-label" for="role-owner">сдать жильё</label>
                  </div>
                </fieldset>

                <div class="form-check mb-3">
                  <input
                    id="reg-agree"
                    v-model="form.agree"
                    class="form-check-input"
                    type="checkbox"
                    required
                  >
                  <label class="form-check-label" for="reg-agree">
                    Согласен с правилами сервиса
                  </label>
                </div>

                <button type="submit" class="btn btn-primary w-100">
                  {{ loading ? 'Регистрация…' : 'Зарегистрироваться' }}
                </button>
              </fieldset>
            </form>

            <p class="text-center mt-3 mb-0">
              Уже есть аккаунт? <RouterLink :to="{ name: 'login' }">Войти</RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
