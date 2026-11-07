<script setup>
import { assetUrl } from '@/utils/format'
</script>

<template>
  <div class="container py-5">
    <div class="empty-state text-center py-5">
      <img :src="assetUrl('img/hero.svg')" alt="" width="160" height="140">
      <h1 class="h2 mt-3">Такой страницы нет</h1>
      <p class="text-muted-warm">Возможно, ссылка устарела или в адресе опечатка.</p>
      <div class="d-flex flex-wrap justify-content-center gap-2">
        <RouterLink class="btn btn-primary" :to="{ name: 'search' }">Найти ресторан</RouterLink>
        <RouterLink class="btn btn-outline-primary" :to="{ name: 'home' }">На главную</RouterLink>
      </div>
    </div>
  </div>
</template>
