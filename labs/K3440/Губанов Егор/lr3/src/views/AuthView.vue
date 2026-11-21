<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { returnPath } from '../constants.js'
import { useAuth } from '../composables/useAuth.js'
import AuthForm from '../components/AuthForm.vue'

const props = defineProps({ mode: { type: String, required: true } })
const route = useRoute()
const router = useRouter()
const { authenticate } = useAuth()
const busy = ref(false)
const error = ref('')
const register = computed(() => props.mode === 'register')
const next = computed(() => returnPath(route.query.next))

async function submit(body) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await authenticate(props.mode, body)
    await router.replace(next.value)
  } catch (cause) {
    error.value = cause.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="brutal-card auth-wrap mx-auto">
    <h1 class="display-title">{{ register ? 'Создать аккаунт' : 'Вход' }}</h1>
    <p v-if="route.query.next === '/profile'" class="lead-copy mb-0">
      {{ register ? 'Создай аккаунт, чтобы сохранять тренировки в план.' : 'Войди, чтобы открыть свой план тренировок.' }}
    </p>
    <AuthForm :mode="mode" :busy="busy" :error="error" @submit="submit" />
    <p class="mt-4 mb-0">
      {{ register ? 'Уже есть аккаунт?' : 'Пока нет аккаунта?' }}
      <RouterLink :to="{ name: register ? 'login' : 'register', query: { next } }">
        {{ register ? 'Войти' : 'Зарегистрироваться' }}
      </RouterLink>
    </p>
  </section>
</template>