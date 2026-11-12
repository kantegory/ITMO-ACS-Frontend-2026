<script setup>
defineProps({ restaurant: { type: Object, required: true }, selected: { type: Boolean, default: false } });
defineEmits(['select']);
</script>
<template>
  <article class="card" :class="{ selected }">
    <div class="card-art" :style="{ background: restaurant.color }" role="img" :aria-label="`Иллюстрация ресторана ${restaurant.name}`">{{ restaurant.emoji }}</div>
    <div class="card-content"><p class="eyebrow">{{ restaurant.cuisine }}</p><h3>{{ restaurant.name }}</h3><p>{{ restaurant.description }}</p><button type="button" @click="$emit('select', restaurant)">Выбрать ресторан</button></div>
  </article>
</template>
