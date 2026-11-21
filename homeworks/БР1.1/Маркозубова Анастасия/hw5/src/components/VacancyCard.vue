<script setup>
defineProps({ vacancy: { type: Object, required: true } });
defineEmits(['select']);
</script>

<template>
  <article class="card">
    <span class="badge">{{ vacancy.industry }}</span>
    <h2>{{ vacancy.title }}</h2>
    <p>{{ vacancy.company }}</p>
    <p>От {{ vacancy.salary.toLocaleString('ru-RU') }} ₽</p>
    <p>{{ vacancy.experience }}</p>
    <button @click="$emit('select', vacancy)">Подробнее</button>
  </article>
</template>
