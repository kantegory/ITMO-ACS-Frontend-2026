<script setup>
import { nextTick, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import AlertBanner from '@/components/common/AlertBanner.vue'
import { useAuthStore } from '@/stores/auth'
import { useAsyncState } from '@/composables/useAsyncState'
import { getSafeNextPath } from '@/router'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { loading, error, clearError, run } = useAsyncState()

const emailRef = ref(null)
const hasInvalid = ref(false)
const form = reactive({
  email: '',
  password: '',
  remember: true,
})

function resetErrors() {
  clearError()
  hasInvalid.value = false
}

async function handleSubmit() {
  if (loading.value) return
  resetErrors()

  try {
    await run(() =>
      auth.login({ email: form.email.trim(), password: form.password }, form.remember),
    )
    router.replace(getSafeNextPath(route.query.next, '/profile'))
  } catch {
    hasInvalid.value = true
    await nextTick()
    emailRef.value?.focus()
  }
}
</script>

<template>
  <AppLayout main-class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h1 class="h3 mb-4 text-center">Вход</h1>
            <AlertBanner :message="error" type="danger" />

            <form @submit.prevent="handleSubmit" @input="resetErrors">
              <fieldset :disabled="loading">
                <div class="mb-3">
                  <label for="login-email" class="form-label">Email</label>
                  <input
                    id="login-email"
                    ref="emailRef"
                    v-model="form.email"
                    type="email"
                    :class="['form-control', { 'is-invalid': hasInvalid }]"
                    :aria-invalid="hasInvalid ? 'true' : undefined"
                    placeholder="name@example.com"
                    autocomplete="email"
                    required
                  >
                </div>

                <div class="mb-3">
                  <label for="login-password" class="form-label">Пароль</label>
                  <input
                    id="login-password"
                    v-model="form.password"
                    type="password"
                    :class="['form-control', { 'is-invalid': hasInvalid }]"
                    :aria-invalid="hasInvalid ? 'true' : undefined"
                    minlength="6"
                    autocomplete="current-password"
                    required
                  >
                </div>

                <div class="form-check mb-3">
                  <input
                    id="login-remember"
                    v-model="form.remember"
                    class="form-check-input"
                    type="checkbox"
                  >
                  <label class="form-check-label" for="login-remember">Запомнить меня</label>
                </div>

                <button type="submit" class="btn btn-primary w-100">
                  {{ loading ? 'Вход…' : 'Войти' }}
                </button>
              </fieldset>
            </form>

            <p class="text-center mt-3 mb-0">
              Нет аккаунта? <RouterLink :to="{ name: 'register' }">Зарегистрироваться</RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
