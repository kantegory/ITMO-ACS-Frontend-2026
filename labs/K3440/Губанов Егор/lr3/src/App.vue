<script setup>
import { computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import { useAuth } from './composables/useAuth.js'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

watch(isAuthenticated, value => {
  if (!value && route.meta.requiresAuth) {
    router.replace({ name: 'login', query: { next: route.fullPath } })
  }
})

const pageKey = computed(() => route.name === 'catalog' ? route.path : route.fullPath)

watch(pageKey, async () => {
  await nextTick()
  document.querySelector('#content')?.focus({ preventScroll: true })
})

</script>

<template>
  <a class="skip-link" href="#content">К содержимому</a>
  <SiteHeader />
  <main id="content" class="container-xl py-4 py-md-5" tabindex="-1">
    <RouterView :key="pageKey" />
  </main>
</template>