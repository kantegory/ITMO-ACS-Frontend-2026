<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Collapse } from 'bootstrap'
import { useAuthStore } from '@/stores/auth'
import SvgIcon from './SvgIcon.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const menuRef = ref(null)

function handleLogout() {
  auth.logout()
  router.push({ name: 'search' })
}

watch(
  () => route.fullPath,
  () => {
    if (menuRef.value?.classList.contains('show')) {
      Collapse.getOrCreateInstance(menuRef.value).hide()
    }
  },
)

onBeforeUnmount(() => {
  if (menuRef.value) {
    Collapse.getInstance(menuRef.value)?.dispose()
  }
})
</script>

<template>
  <header>
    <nav class="navbar navbar-expand-lg bg-body border-bottom" aria-label="Основное меню">
      <div class="container">
        <RouterLink class="navbar-brand fw-bold" :to="{ name: 'search' }">
          <SvgIcon name="home" /> Аренда жилья
        </RouterLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainMenu"
          aria-controls="mainMenu"
          aria-expanded="false"
          aria-label="Открыть меню"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="mainMenu" ref="menuRef" class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <RouterLink class="nav-link" exact-active-class="active" :to="{ name: 'search' }">
                <SvgIcon name="search" /> Поиск
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" active-class="active" :to="{ name: 'messages' }">
                <SvgIcon name="message" /> Сообщения
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" active-class="active" :to="{ name: 'profile' }">
                <SvgIcon name="user" /> Личный кабинет
              </RouterLink>
            </li>
          </ul>

          <div v-if="!auth.isAuthenticated" class="d-flex flex-wrap gap-2 mt-2 mt-lg-0">
            <RouterLink class="btn btn-outline-primary" :to="{ name: 'login' }">
              <SvgIcon name="login" /> Вход
            </RouterLink>
            <RouterLink class="btn btn-primary" :to="{ name: 'register' }">
              Регистрация
            </RouterLink>
          </div>

          <div v-else class="d-flex align-items-center flex-wrap gap-3 mt-2 mt-lg-0">
            <span class="navbar-text">{{ auth.fullName }}</span>
            <button class="btn btn-outline-secondary" type="button" @click="handleLogout">
              <SvgIcon name="logout" /> Выйти
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
