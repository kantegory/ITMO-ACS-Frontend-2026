<script setup>
import EmptyState from '@/components/EmptyState.vue'
import BaseLayout from '@/layouts/BaseLayout.vue'
</script>

<template>
  <BaseLayout>
    <div class="container py-5">
      <EmptyState class="my-5">
        <h1 class="h3">Такой страницы нет</h1>
        <p>Возможно, рецепт удалили или в адресе опечатка.</p>
        <RouterLink class="btn btn-accent" :to="{ name: 'search' }">К рецептам</RouterLink>
      </EmptyState>
    </div>
  </BaseLayout>
</template>
