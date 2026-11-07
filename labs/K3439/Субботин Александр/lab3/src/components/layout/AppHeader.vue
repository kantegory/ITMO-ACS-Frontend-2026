<script setup>
import { Collapse } from 'bootstrap'
import { useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'

import ThemeSwitcher from '@/components/layout/ThemeSwitcher.vue'
import UserMenu from '@/components/layout/UserMenu.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAuth } from '@/composables/useAuth'

const { isLoggedIn } = useAuth()
const route = useRoute()
const nav = useTemplateRef('nav')

// На телефоне меню раскрывается поверх страницы — после перехода по ссылке сворачиваем его
watch(() => route.fullPath, () => {
  Collapse.getInstance(nav.value)?.hide()
})
</script>

<template>
  <header class="site-header sticky-top">
    <nav class="navbar navbar-expand-lg" aria-label="Основное меню">
      <div class="container">
        <RouterLink class="navbar-brand brand-logo" :to="{ name: 'home' }">
          <AppIcon class="icon-lg" name="logo" />
          Столик
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
          <span class="navbar-toggler-icon"></span>
        </button>
        <div id="mainNav" ref="nav" class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-3 mb-lg-0">
            <li class="nav-item"><RouterLink class="nav-link" :to="{ name: 'search' }">Рестораны</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" :to="{ name: 'bookings' }">Мои брони</RouterLink></li>
          </ul>
          <ThemeSwitcher />
          <UserMenu v-if="isLoggedIn" />
          <!-- Кнопкам входа подсветка текущей страницы не нужна: .active у .btn выглядит как нажатая -->
          <div v-else class="d-flex gap-2">
            <RouterLink class="btn btn-outline-primary" active-class="" exact-active-class="" :to="{ name: 'login' }">Войти</RouterLink>
            <RouterLink class="btn btn-primary" active-class="" exact-active-class="" :to="{ name: 'register' }">Регистрация</RouterLink>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
