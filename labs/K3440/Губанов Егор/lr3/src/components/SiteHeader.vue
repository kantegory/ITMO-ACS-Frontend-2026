<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useTheme } from '../composables/useTheme.js'

const router = useRouter()
const { isAuthenticated, logout } = useAuth()
const { mode } = useTheme()

function exit() {
  logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <header class="site-header">
    <div class="container-xl header-inner">
      <RouterLink class="brand" to="/">ВМЕСТЕ</RouterLink>

      <label class="visually-hidden" for="site-theme">Тема оформления</label>
      <select id="site-theme" v-model="mode" class="form-select theme-select">
        <option value="system">Как в системе</option>
        <option value="light">Светлая</option>
        <option value="dark">Тёмная</option>
      </select>

      <nav class="site-nav" aria-label="Основная навигация">
        <RouterLink to="/" exact-active-class="active">Занятия</RouterLink>
        <RouterLink to="/profile" active-class="active">Мой план</RouterLink>
        <RouterLink to="/blog" active-class="active">Блог</RouterLink>
        <button v-if="isAuthenticated" class="nav-button" type="button" @click="exit">
          Выйти
        </button>
        <template v-else>
          <RouterLink to="/login" active-class="active">Войти</RouterLink>
          <RouterLink to="/register" active-class="active">Регистрация</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>