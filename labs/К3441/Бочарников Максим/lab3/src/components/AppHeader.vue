<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-lg navbar-dark" aria-label="Главная навигация">
      <div class="container">
        <RouterLink class="navbar-brand brand" aria-label="VICE BITES — на главную" to="/">
          <span class="brand-mark" aria-hidden="true" />
          VICE BITES
        </RouterLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Открыть меню"
        >
          <span class="navbar-toggler-icon" />
        </button>
        <div id="mainNav" class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li class="nav-item">
              <button
                type="button"
                class="btn btn-vice theme-toggle"
                :aria-pressed="theme === 'night'"
                :aria-label="
                  theme === 'night' ? 'Включить светлую тему' : 'Включить тёмную тему'
                "
                @click="toggleTheme"
              >
                <Icon :name="theme === 'night' ? 'sun' : 'moon'" class-name="icon--sm" />
                <span>{{ theme === 'night' ? 'День' : 'Ночь' }}</span>
              </button>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/" active-class="active">Рецепты</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/profile" active-class="active">
                <Icon name="user" class-name="icon--sm" />
                Кабинет
              </RouterLink>
            </li>
            <template v-if="isLoggedIn">
              <li class="nav-item">
                <RouterLink
                  class="nav-link"
                  to="/profile"
                  :aria-label="`Личный кабинет: ${user.name || user.email}`"
                >
                  {{ user.name || user.email }}
                </RouterLink>
              </li>
              <li class="nav-item ms-lg-2">
                <button
                  type="button"
                  class="btn btn-vice btn-vice-teal"
                  aria-label="Выйти из аккаунта"
                  @click="logoutAndGoHome"
                >
                  <Icon name="logout" class-name="icon--sm" />
                  Выйти
                </button>
              </li>
            </template>
            <template v-else>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/login">Вход</RouterLink>
              </li>
              <li class="nav-item ms-lg-2">
                <RouterLink class="btn btn-vice btn-vice-primary" to="/register">
                  Регистрация
                </RouterLink>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import Icon from '@/components/Icon.vue'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'

const { user, isLoggedIn, logoutAndGoHome } = useAuth()
const { theme, toggleTheme } = useTheme()
</script>
