<script setup>
import { useRouter } from 'vue-router'

import BaseIcon from '@/components/BaseIcon.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import useAuthStore from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

// сначала уходим с закрытой страницы, потом завершаем сессию
async function logout() {
  await router.push({ name: 'search' })
  auth.logout()
}
</script>

<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-lg" aria-label="Основное меню">
      <div class="container">
        <RouterLink class="navbar-brand brand" :to="{ name: 'search' }">
          <span class="brand__icon"><BaseIcon name="ladle" /></span>
          Поварёшка
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
          <!-- RouterLink сам ставит класс active и aria-current="page" -->
          <ul class="navbar-nav me-auto ms-lg-4">
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'search' }">Рецепты</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'cooks' }">Кулинары</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'profile' }">Мой кабинет</RouterLink>
            </li>
          </ul>

          <ThemeSwitcher />

          <div class="d-flex gap-2 mt-3 mt-lg-0">
            <template v-if="auth.isLoggedIn">
              <div class="dropdown">
                <button class="btn btn-soft d-flex align-items-center gap-2 ps-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <UserAvatar :user="auth.user" size="sm" /> {{ auth.user.name }}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><RouterLink class="dropdown-item" :to="{ name: 'profile' }">Мой кабинет</RouterLink></li>
                  <li><RouterLink class="dropdown-item" :to="{ name: 'author', params: { id: auth.user.id } }">Моя страница</RouterLink></li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <button class="dropdown-item" type="button" @click="logout">
                      <BaseIcon name="logout" /> Выйти
                    </button>
                  </li>
                </ul>
              </div>
            </template>
            <template v-else>
              <RouterLink class="btn btn-outline-accent" :to="{ name: 'login' }">Войти</RouterLink>
              <RouterLink class="btn btn-accent" :to="{ name: 'register' }">Регистрация</RouterLink>
            </template>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
