<script setup>
import { RouterLink } from 'vue-router';
defineProps({ restaurant: { type: Object, required: true } });
const photoUrls = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&w=900&q=80'
];
</script>
<template>
  <article class="restaurant-card">
    <div class="restaurant-art" :style="{ '--art': restaurant.color }">
      <img :src="photoUrls[(Number(restaurant.id)-1)%photoUrls.length]" alt="" loading="lazy">
    </div>
    <div class="restaurant-body">
      <div class="d-flex justify-content-between gap-3"><h3>{{ restaurant.name }}</h3><span class="restaurant-rating" :aria-label="`Рейтинг ${restaurant.rating} из 5`">★ {{ restaurant.rating }}</span></div>
      <p class="meta">{{ restaurant.cuisine }} · {{ restaurant.district }} · {{ '₽'.repeat(restaurant.price) }}</p>
      <p class="description">{{ restaurant.description }}</p>
      <RouterLink class="btn btn-outline-primary" :to="`/restaurants/${restaurant.id}`" :aria-label="`Подробнее о ресторане ${restaurant.name}`">О ресторане</RouterLink>
    </div>
  </article>
</template>
