<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ToastHost from '@/components/ToastHost.vue'
import useAuthStore from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// сессия может закончиться прямо на закрытой странице (истёк токен) —
// тогда, как и в guard роутера, отправляем на вход
watch(() => auth.isLoggedIn, (loggedIn) => {
  if (!loggedIn && route.meta.requiresAuth) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
  }
})
</script>

<template>
  <router-view />
  <ToastHost />
</template>
