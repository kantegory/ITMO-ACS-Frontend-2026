<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "./composables/useAuth.js";
import AppHeader from "./components/AppHeader.vue";

const router = useRouter();
const { isAuthenticated, logout } = useAuth();
const toast = ref("");
let timer;
function notify(message) {
  toast.value = message;
  clearTimeout(timer);
  timer = setTimeout(() => (toast.value = ""), 3000);
}
function signOut() {
  logout();
  notify("Вы вышли из аккаунта");
  router.push("/");
}
</script>

<template>
  <div class="app-shell">
    <AppHeader :authenticated="isAuthenticated" @logout="signOut" />
    <main><RouterView @notify="notify" /></main>
    <footer>
      <div class="container footer-grid">
        <div>
          <strong class="brand footer-brand">Ложка</strong>
          <p>Вкусные истории начинаются на вашей кухне.</p>
        </div>
        <div>
          <strong>Разделы</strong>
          <RouterLink to="/recipes">Рецепты</RouterLink>
          <RouterLink to="/community">Авторы</RouterLink>
        </div>
        <div>
          <strong>Аккаунт</strong>
          <RouterLink to="/login">Войти</RouterLink>
          <RouterLink to="/register">Регистрация</RouterLink>
        </div>
      </div>
      <div class="container footer-bottom">© 2026 Ложка</div>
    </footer>
    <Transition name="toast"
      ><div v-if="toast" class="toast" role="status">
        {{ toast }}
      </div></Transition
    >
  </div>
</template>
