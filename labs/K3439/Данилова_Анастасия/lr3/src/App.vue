<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useTheme } from './composables/useTheme'

const route = useRoute()
const router = useRouter()
const { user, signOut } = useAuth()
const { theme, toggleTheme } = useTheme()
const content = ref(null)

watch(() => route.path, async (_, previous) => {
  if (previous) {
    await nextTick()
    content.value?.focus()
  }
})

function logout() {
  signOut()
  router.push({ name: 'login' })
}
</script>

<template>
  <a href="#content" class="visually-hidden-focusable skip-link" @click.prevent="content?.focus()">
    Перейти к содержимому
  </a>
  <header class="surface border-bottom">
    <nav class="container d-flex flex-wrap align-items-center gap-3 py-3" aria-label="Основная навигация">
      <RouterLink class="navbar-brand fw-bold" to="/">Snimu</RouterLink>
      <RouterLink class="nav-link" to="/">Поиск</RouterLink>
      <RouterLink v-if="user" class="nav-link" to="/profile">Кабинет</RouterLink>
      <RouterLink v-if="user" class="nav-link" to="/messages">Сообщения</RouterLink>
      <button class="btn btn-outline-secondary btn-sm ms-md-auto" :aria-pressed="theme === 'dark'" @click="toggleTheme">
        Тёмная тема
      </button>
      <button v-if="user" class="btn btn-outline-secondary btn-sm" @click="logout">Выйти ({{ user.firstName }})</button>
      <RouterLink v-else class="btn btn-outline-primary btn-sm" to="/login">Войти</RouterLink>
    </nav>
  </header>
  <main id="content" ref="content" class="container py-4" tabindex="-1">
    <RouterView :key="route.path" />
  </main>
</template>
