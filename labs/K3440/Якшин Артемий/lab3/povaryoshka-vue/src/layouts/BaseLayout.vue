<script setup>
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'

defineProps({
  // у страниц входа и регистрации подвал прилегает к контенту
  flush: { type: Boolean, default: false }
})

// в SPA ссылка-пропуск не меняет адрес, а просто переводит фокус на контент
function skipToMain() {
  document.getElementById('main')?.focus()
}
</script>

<template>
  <a class="skip-link" href="#main" @click.prevent="skipToMain">Перейти к основному содержанию</a>
  <AppHeader />
  <main id="main" tabindex="-1">
    <slot />
  </main>
  <AppFooter :class="{ 'mt-0': flush }" />
</template>
