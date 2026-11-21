<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "./AppIcon.vue";
import { useAuth } from "../composables/useAuth";
import { useTheme } from "../composables/useTheme";

const router = useRouter();
const { user, clearSession } = useAuth();
const { theme, toggleTheme } = useTheme();
const navExpanded = ref(false);

function logout() {
  clearSession();
  router.push("/");
}
</script>

<template>
  <header>
    <nav
      class="navbar navbar-expand-lg navbar-dark"
      style="background-color:#922b21;"
      aria-label="Основная навигация"
    >
      <div class="container">
        <router-link class="navbar-brand" to="/">TableBook</router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          :aria-expanded="navExpanded ? 'true' : 'false'"
          aria-label="Открыть меню навигации"
          @click="navExpanded = !navExpanded"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto">
            <li class="nav-item"><router-link class="nav-link" to="/">Поиск ресторанов</router-link></li>
            <li class="nav-item"><router-link class="nav-link" to="/profile">Личный кабинет</router-link></li>
          </ul>
          <button
            type="button"
            id="theme-toggle"
            class="btn btn-outline-light btn-sm me-2 d-inline-flex align-items-center justify-content-center"
            style="width:2.25rem;height:2.25rem;"
            :aria-label="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
            :aria-pressed="theme === 'dark' ? 'true' : 'false'"
            @click="toggleTheme"
          >
            <AppIcon :name="theme === 'dark' ? 'icon-sun' : 'icon-moon'" />
          </button>
          <ul class="navbar-nav align-items-lg-center">
            <li v-if="user" class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle text-white"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                :aria-label="`Меню пользователя ${user.name}`"
              >{{ user.name }}</a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><router-link class="dropdown-item" to="/profile">Личный кабинет</router-link></li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="logout">
                    <AppIcon name="icon-logout" /> Выйти
                  </a>
                </li>
              </ul>
            </li>
            <template v-else>
              <li class="nav-item"><router-link class="nav-link" to="/login">Вход</router-link></li>
              <li class="nav-item"><router-link class="btn btn-light btn-sm ms-2" to="/register">Регистрация</router-link></li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>
