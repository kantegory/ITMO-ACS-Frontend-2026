<script setup>
import { computed, ref } from 'vue';
import RestaurantCard from './components/RestaurantCard.vue';
import BookingSummary from './components/BookingSummary.vue';
const restaurants = [
  { id: 1, name: 'Тёплый хлеб', cuisine: 'Европейская кухня', description: 'Завтраки весь день и свежая выпечка.', emoji: '🥐', color: '#eee0c8' },
  { id: 2, name: 'Лист и рис', cuisine: 'Азиатская кухня', description: 'Рамен и лапша ручной работы.', emoji: '🍜', color: '#e1e9d7' },
  { id: 3, name: 'Соль и море', cuisine: 'Средиземноморская кухня', description: 'Морепродукты и домашние лимонады.', emoji: '🦐', color: '#dce8e7' }
];
const query = ref('');
const selected = ref(null);
const found = computed(() => restaurants.filter(r => r.name.toLocaleLowerCase('ru').includes(query.value.toLocaleLowerCase('ru'))));
</script>
<template>
  <main class="container"><header><p class="eyebrow">Домашняя работа 5 · Vue 3</p><h1>Найдите место для встречи</h1><p>Компоненты передают данные через props и событие выбора; поиск и план встречи обновляются реактивно.</p></header><section aria-labelledby="places-title"><div class="section-heading"><h2 id="places-title">Рестораны</h2><label for="query">Поиск <input id="query" v-model="query" type="search" placeholder="Название ресторана"></label></div><p v-if="!found.length">Совпадений нет</p><div class="grid"><RestaurantCard v-for="restaurant in found" :key="restaurant.id" :restaurant="restaurant" :selected="selected?.id === restaurant.id" @select="selected = $event" /></div></section><BookingSummary :restaurant="selected" /></main>
</template>
