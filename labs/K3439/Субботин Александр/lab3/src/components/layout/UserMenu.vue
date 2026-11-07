<script setup>
import { useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import { getInitials } from '@/utils/format'

const { user, logout } = useAuth()
const router = useRouter()

function onLogout() {
  logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="dropdown">
    <button class="btn user-menu dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      <span class="avatar avatar-sm" aria-hidden="true">{{ getInitials(user.name) }}</span>
      <span>{{ user.name }}</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
      <li><RouterLink class="dropdown-item" :to="{ name: 'profile' }">Личный кабинет</RouterLink></li>
      <li><RouterLink class="dropdown-item" :to="{ name: 'bookings' }">История бронирований</RouterLink></li>
      <li><hr class="dropdown-divider"></li>
      <li><button class="dropdown-item" type="button" @click="onLogout">Выйти</button></li>
    </ul>
  </div>
</template>
