<script setup>
import { computed } from 'vue'
import { formatPrice } from '@/utils/formatters'
const props = defineProps({ listing: { type: Object, required: true } })
const imageUrl = computed(() => `/${props.listing.image.replace(/^\//, '')}`)
</script>

<template>
  <article class="rs-card property-card">
    <div class="property-cover">
      <img :src="imageUrl" :alt="listing.title" /><span class="rs-badge badge-blue">{{
        listing.mode === 'DAILY' ? 'Посуточно' : 'Помесячно'
      }}</span>
    </div>
    <div class="property-body">
      <div class="property-type">{{ listing.type }}</div>
      <h2>{{ listing.title }}</h2>
      <p class="rs-muted">{{ listing.location }}, {{ listing.address }}</p>
      <strong class="property-price"
        >{{ formatPrice(listing.price) }} /
        {{ listing.mode === 'DAILY' ? 'ночь' : 'месяц' }}</strong
      >
      <p>{{ listing.description }}</p>
      <RouterLink
        class="btn btn-primary w-100"
        :to="{ name: 'listing', params: { id: listing.id } }"
        >Подробнее</RouterLink
      >
    </div>
  </article>
</template>

<style scoped>
.property-card {
  overflow: hidden;
}
.property-cover {
  position: relative;
  height: 220px;
}
.property-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.property-cover .rs-badge {
  position: absolute;
  top: 14px;
  left: 14px;
}
.property-body {
  padding: 20px;
}
.property-type {
  color: var(--rs-primary);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}
.property-body h2 {
  min-height: 48px;
  margin: 8px 0;
  font-size: 20px;
  font-weight: 700;
}
.property-price {
  display: block;
  margin-bottom: 12px;
  font-size: 21px;
}
</style>
