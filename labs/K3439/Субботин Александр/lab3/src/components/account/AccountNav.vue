<script setup>
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/ui/AppIcon.vue'
import { useAuth } from '@/composables/useAuth'

// Меню личного кабинета. Активным считаем только раздел-страницу: ссылки на #favorites и
// #notifications ведут к блокам внутри профиля, поэтому RouterLink рисует их сам (custom)
const route = useRoute()
const router = useRouter()
const { logout } = useAuth()

const items = [
  { label: 'Профиль', icon: 'user', to: { name: 'profile' } },
  { label: 'История бронирований', icon: 'list', to: { name: 'bookings' } },
  { label: 'Избранное', icon: 'heart', to: { name: 'profile', hash: '#favorites' } },
  { label: 'Уведомления', icon: 'bell', to: { name: 'profile', hash: '#notifications' } },
]

const isCurrent = (item) => !item.to.hash && route.name === item.to.name

function onLogout() {
  logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <nav class="list-group account-nav" aria-label="Разделы кабинета">
    <RouterLink v-for="item in items" :key="item.label" v-slot="{ href, navigate }" :to="item.to" custom>
      <a
        class="list-group-item list-group-item-action"
        :class="{ active: isCurrent(item) }"
        :href="href"
        :aria-current="isCurrent(item) ? 'page' : undefined"
        @click="navigate"
      ><AppIcon :name="item.icon" />{{ item.label }}</a>
    </RouterLink>
    <button class="list-group-item list-group-item-action text-danger" type="button" @click="onLogout"><AppIcon name="logout" />Выйти</button>
  </nav>
</template>
