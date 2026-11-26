<script setup>
import { RouterLink } from 'vue-router';
import { formatPrice } from '@lab1/catalog.js';
import { photo } from '../assets.js';
import SiteIcon from './SiteIcon.vue';

defineProps({ restaurant: { type: Object, required: true } });
</script>

<template>
  <article class="restaurant-card panel">
    <img :src="photo(restaurant.image)" :alt="restaurant.imageAlt" width="760" height="507" loading="lazy">
    <div class="card-body">
      <div class="card-title-row">
        <h3><RouterLink class="stretched-link" :to="{ name: 'restaurant', params: { id: restaurant.id } }">{{ restaurant.name }}</RouterLink></h3>
        <span class="rating"><SiteIcon name="star" /> <span class="visually-hidden">Оценка из 5 </span>{{ restaurant.rating.toFixed(1).replace('.', ',') }}</span>
      </div>
      <p class="card-meta">{{ restaurant.cuisine }} · {{ restaurant.district }} район</p>
      <p class="card-price">{{ formatPrice(restaurant.price) }} / человек</p>
    </div>
  </article>
</template>
