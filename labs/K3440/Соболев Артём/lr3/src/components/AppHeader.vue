<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import { useTheme } from "../composables/useTheme.js";
const auth = useAuthStore();
const { theme, toggleTheme } = useTheme();
const router = useRouter();
function signOut() {
  auth.logout();
  router.push("/");
}
</script>
<template>
  <nav class="navbar site-nav sticky-top" aria-label="Основная навигация">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">Fitness Platform</RouterLink>
      <div class="nav-items">
        <RouterLink class="nav-link" to="/workouts">Тренировки</RouterLink>
        <RouterLink class="nav-link" to="/blog">
          Блог о здоровье и питании
        </RouterLink>
        <RouterLink v-if="auth.authenticated" class="nav-link" to="/account">
          Мой прогресс
        </RouterLink>
        <button v-if="auth.authenticated" class="btn btn-dark" @click="signOut">
          Выйти
        </button>
        <RouterLink v-else class="btn btn-dark" to="/login">Войти</RouterLink>
      </div>
      <button
        class="theme-toggle"
        :aria-pressed="theme === 'dark'"
        :aria-label="
          theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'
        "
        @click="toggleTheme"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.2 15.6A8.5 8.5 0 0 1 8.4 3.8 8.7 8.7 0 1 0 20.2 15.6Z" /></svg>
        <span>{{ theme === "dark" ? "Светлая тема" : "Тёмная тема" }}</span>
      </button>
    </div>
  </nav>
</template>
