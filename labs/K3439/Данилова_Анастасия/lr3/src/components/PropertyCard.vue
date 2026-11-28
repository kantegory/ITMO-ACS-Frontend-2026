<script setup>
import { formatPrice, TYPE_NAMES } from '../format'
defineProps({ property: { type: Object, required: true } })
</script>

<template>
  <article class="card h-100">
    <img v-if="property.images?.[0]" :src="property.images[0]" :alt="'Фото: ' + property.title" class="card-img-top" loading="lazy">
    <div class="card-body">
      <span class="badge text-bg-secondary me-1">{{ TYPE_NAMES[property.type] }}</span>
      <span v-if="!property.isAvailable" class="badge text-bg-secondary">Сдано</span>
      <h2 class="h5 mt-2">{{ property.title }}</h2>
      <p class="text-body-secondary">{{ property.city }}, {{ property.address }}</p>
      <p class="price">{{ formatPrice(property.pricePerMonth) }} / мес</p>
      <RouterLink class="btn btn-outline-primary btn-sm" :to="{ name: 'property', params: { id: property.id } }">
        Подробнее<span class="visually-hidden"> об объекте «{{ property.title }}»</span>
      </RouterLink>
    </div>
  </article>
</template>
