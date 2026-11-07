<template>
  <a class="skip-link" href="#main" @click.prevent="focusMain">Перейти к содержимому</a>
  <app-header />
  <router-view :key="$route.fullPath.split('?')[0]" />
  <app-footer />
  <app-toast />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppToast from '@/components/AppToast.vue'
import { useNotify } from '@/composables/useNotify'
import { useProfiles } from '@/composables/useProfiles'
import { useSaved } from '@/composables/useSaved'

const { load: loadProfiles } = useProfiles()
const { load: loadSaved } = useSaved()
const { notify } = useNotify()
const router = useRouter()

function focusMain() {
  document.getElementById('main')?.focus()
}

onMounted(async () => {
  await router.isReady()
  Promise.all([loadProfiles(), loadSaved()]).catch((error) => notify(error.message))
})
</script>
