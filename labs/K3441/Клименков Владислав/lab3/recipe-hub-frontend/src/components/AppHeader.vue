<script setup>
/**
 * AppHeader.vue — единая шапка SPA: навигация, тема и состояние авторизации.
 */

import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Collapse } from 'bootstrap';
import BaseIcon from './BaseIcon.vue';
import ThemeSwitcher from './ThemeSwitcher.vue';
import { useAuthStore } from '@/stores/auth';
import { announce } from '@/composables/useLiveRegion';

const auth = useAuthStore();
const router = useRouter();
const navbar = ref(null);

/** Закрыть мобильное меню после перехода по ссылке. */
function closeNavbar() {
  if (!navbar.value) return;
  const instance = Collapse.getInstance(navbar.value);
  if (instance && navbar.value.classList.contains('show')) instance.hide();
}

function logout() {
  auth.logout();
  announce('Вы вышли из аккаунта');
  closeNavbar();
  router.push({ name: 'home' });
}
</script>

<template>
  <header>
    <nav
      class="navbar navbar-expand-lg bg-body border-bottom"
      aria-label="Основная навигация"
    >
      <div class="container">
        <RouterLink
          class="navbar-brand fw-semibold"
          to="/"
          @click="closeNavbar"
        >
          RecipeHub
        </RouterLink>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Переключить навигацию"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="mainNav" ref="navbar" class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/"
                exact-active-class="active"
                @click="closeNavbar"
              >
                Главная
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/search"
                active-class="active"
                @click="closeNavbar"
              >
                Поиск рецептов
              </RouterLink>
            </li>
            <li v-if="auth.user" class="nav-item">
              <RouterLink
                class="nav-link"
                to="/profile"
                active-class="active"
                @click="closeNavbar"
              >
                Личный кабинет
              </RouterLink>
            </li>
          </ul>

          <div class="d-flex flex-wrap align-items-center gap-2">
            <ThemeSwitcher />

            <template v-if="auth.ready">
              <div v-if="!auth.user" class="d-flex gap-2">
                <RouterLink class="btn btn-outline-secondary" to="/login">
                  Вход
                </RouterLink>
                <RouterLink class="btn btn-rh-primary" to="/register">
                  Регистрация
                </RouterLink>
              </div>

              <div v-else class="dropdown">
                <button
                  class="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <BaseIcon name="user" class="me-1" />
                  <span>{{ auth.user.name }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <RouterLink class="dropdown-item" to="/profile">
                      Личный кабинет
                    </RouterLink>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <button
                      class="dropdown-item d-flex align-items-center gap-2"
                      type="button"
                      @click="logout"
                    >
                      <BaseIcon name="logout" />
                      <span>Выйти</span>
                    </button>
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
