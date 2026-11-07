<template>
  <header>
    <nav class="navbar navbar-expand-lg" aria-label="Основное меню">
      <div class="container">
        <router-link
          class="navbar-brand"
          :to="{ name: 'home' }"
          aria-label="Вкусная лента, на главную"
        >
          <app-icon name="logo" /> Вкусная лента
        </router-link>
        <button
          class="navbar-toggler"
          type="button"
          aria-controls="mainNav"
          :aria-expanded="String(menuOpen)"
          aria-label="Открыть меню"
          @click="menuOpen = !menuOpen"
        >
          <span class="navbar-toggler-icon" />
        </button>
        <div id="mainNav" class="collapse navbar-collapse" :class="{ show: menuOpen }">
          <ul class="navbar-nav me-auto">
            <li v-for="link in links" :key="link.name" class="nav-item">
              <router-link
                class="nav-link"
                :to="{ name: link.name }"
                active-class="active"
                exact-active-class="active"
              >
                {{ link.label }}
              </router-link>
            </li>
          </ul>
          <button
            type="button"
            class="btn theme-toggle me-lg-2 my-2 my-lg-0"
            :aria-pressed="String(theme === 'dark')"
            :title="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
            @click="toggle"
          >
            <app-icon :name="theme === 'dark' ? 'sun' : 'moon'" />
            <span class="visually-hidden">Тёмная тема</span>
          </button>
          <div class="d-flex flex-wrap align-items-center gap-2 py-2 py-lg-0">
            <template v-if="auth.isAuthenticated">
              <router-link
                class="btn btn-link text-reset text-decoration-none"
                :to="{ name: 'profile' }"
              >
                <app-icon name="user" /> {{ auth.user?.name || auth.user?.email }}
              </router-link>
              <button type="button" class="btn btn-outline-primary" @click="logout">
                Выйти
              </button>
            </template>
            <template v-else>
              <router-link class="btn btn-outline-primary" :to="{ name: 'login' }"
                >Войти</router-link
              >
              <router-link class="btn btn-primary" :to="{ name: 'register' }"
                >Регистрация</router-link
              >
            </template>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { useTheme } from '@/composables/useTheme'
import useAuthStore from '@/stores/auth'

const links = [
  { name: 'home', label: 'Главная' },
  { name: 'search', label: 'Рецепты' },
  { name: 'profile', label: 'Личный кабинет' },
]

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { theme, toggle } = useTheme()
const menuOpen = ref(false)

watch(
  () => route.fullPath,
  () => (menuOpen.value = false),
)

function logout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>
