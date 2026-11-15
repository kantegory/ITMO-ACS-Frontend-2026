<script setup>
import { onMounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import AppIcon from './AppIcon.vue';
import ThemeSwitch from './ThemeSwitch.vue';
import { useAuth } from '../composables/useAuth.js';
import { useFavorites } from '../composables/useFavorites.js';
import { useFormat } from '../composables/useFormat.js';
import * as api from '../api/resources.js';

const router = useRouter();
const { user, isLogged, logout } = useAuth();
const { reset: resetFavorites } = useFavorites();
const { initials } = useFormat();

const unread = ref(0);

async function loadUnread() {
  if (!isLogged.value) {
    unread.value = 0;
    return;
  }
  try {
    const dialogs = await api.fetchDialogs(user.value.id);
    unread.value = dialogs.reduce((sum, d) => sum + (d.unread || 0), 0);
  } catch {
    unread.value = 0;
  }
}

function onLogout() {
  logout();
  resetFavorites();
  router.push({ name: 'home' });
}

onMounted(loadUnread);
watch(user, loadUnread);
</script>

<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-lg py-2" aria-label="Основное меню">
      <div class="container">
        <RouterLink class="brand" :to="{ name: 'home' }">
          <span class="brand-mark"><AppIcon name="key-fill" /></span>Ключи
        </RouterLink>

        <button
          class="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Открыть меню"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="mainNav" class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto ms-lg-4">
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'search' }">Снять жильё</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'profile', hash: '#landlord' }">Сдать жильё</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'messages' }">
                Сообщения
                <span v-if="unread" class="badge-dot">
                  {{ unread }}<span class="visually-hidden"> непрочитанных сообщения</span>
                </span>
              </RouterLink>
            </li>
          </ul>

          <div class="d-flex gap-2 align-items-center mt-3 mt-lg-0">
            <ThemeSwitch />

            <template v-if="!isLogged">
              <RouterLink class="btn btn-outline-primary" :to="{ name: 'login' }">Войти</RouterLink>
              <RouterLink class="btn btn-primary d-none d-sm-inline-block" :to="{ name: 'register' }">
                Регистрация
              </RouterLink>
            </template>

            <div v-else class="dropdown">
              <button
                class="btn d-flex align-items-center gap-2 px-1"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                :aria-label="`Меню пользователя ${user.name}`"
              >
                <span class="avatar" aria-hidden="true">{{ initials(user.name) }}</span>
                <span class="d-none d-md-inline">{{ user.name.split(' ')[0] }}</span>
                <AppIcon name="chevron-down" class="small" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><RouterLink class="dropdown-item" :to="{ name: 'profile' }">Личный кабинет</RouterLink></li>
                <li><RouterLink class="dropdown-item" :to="{ name: 'profile', hash: '#favorites' }">Избранное</RouterLink></li>
                <li><RouterLink class="dropdown-item" :to="{ name: 'messages' }">Сообщения и сделки</RouterLink></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item" type="button" @click="onLogout">Выйти</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
