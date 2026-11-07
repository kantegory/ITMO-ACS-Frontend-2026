<script setup>
// Хлебные крошки: items — [{ label, to }], последний пункт — текущая страница
defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><RouterLink :to="{ name: 'home' }">Главная</RouterLink></li>
      <template v-for="(item, index) in items" :key="item.label">
        <li v-if="index < items.length - 1" class="breadcrumb-item">
          <RouterLink :to="item.to">{{ item.label }}</RouterLink>
        </li>
        <li v-else class="breadcrumb-item active" aria-current="page">{{ item.label }}</li>
      </template>
    </ol>
  </nav>
</template>
