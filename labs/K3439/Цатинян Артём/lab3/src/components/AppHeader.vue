<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import SvgIcon from "./SvgIcon.vue";
const auth = useAuthStore();
const open = ref(false);
</script>
<template>
  <nav
    class="navbar navbar-expand-lg sticky-top"
    aria-label="Основная навигация"
  >
    <div class="container">
      <RouterLink class="navbar-brand" to="/" @click="open = false"
        >tablely<span>.</span></RouterLink
      >
      <button
        class="navbar-toggler"
        type="button"
        aria-label="Открыть меню навигации"
        aria-controls="menu"
        :aria-expanded="open"
        @click="open = !open"
      >
        <SvgIcon name="menu" />
      </button>
      <div id="menu" class="collapse navbar-collapse" :class="{ show: open }">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" @click="open = false"
              >Рестораны</RouterLink
            >
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/profile" @click="open = false"
              >Мои брони</RouterLink
            >
          </li>
          <li class="nav-item ms-lg-3">
            <RouterLink
              class="btn btn-dark rounded-pill px-4"
              :to="auth.user ? '/profile' : '/login'"
              @click="open = false"
              >{{ auth.user ? auth.user.name : "Войти" }}</RouterLink
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
