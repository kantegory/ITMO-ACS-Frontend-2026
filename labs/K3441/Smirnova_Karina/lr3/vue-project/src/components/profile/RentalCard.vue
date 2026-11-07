<script setup>
import { formatDate, formatPrice, getStatusData } from '@/utils/formatters'
defineProps({ booking: { type: Object, required: true } })
</script>
<template>
  <article v-if="booking.listing" class="rs-card rental-card">
    <img :src="`/${booking.listing.image}`" :alt="booking.listing.title" />
    <div class="rental-body">
      <span :class="['rs-badge', getStatusData(booking.status).className]"
        >{{ getStatusData(booking.status).text }}
      </span>
      <h3>{{ booking.listing.title }}</h3>
      <p class="rs-muted">{{ booking.listing.location }}, {{ booking.listing.address }}</p>
      <div>{{ formatDate(booking.startDate) }} — {{ formatDate(booking.endDate) }}</div>
      <strong>{{ formatPrice(booking.total) }}</strong>
    </div>
    <div class="rental-actions">
      <RouterLink
        class="btn btn-primary"
        :to="{ name: 'listing', params: { id: booking.listing.id } }"
        >Подробнее</RouterLink
      >
      <RouterLink
        class="btn btn-link"
        :to="{ name: 'activity', query: { listing: booking.listing.id } }"
        >Написать владельцу</RouterLink
      >
    </div>
  </article>
</template>

<style scoped>
.rental-card {
  display: grid;
  grid-template-columns: 190px 1fr auto;
  gap: 22px;
  align-items: center;
  padding: 18px;
}
.rental-card img {
  width: 190px;
  height: 135px;
  object-fit: cover;
  border-radius: 10px;
}
.rental-body h3 {
  margin: 10px 0 5px;
  font-size: 20px;
}
.rental-body strong {
  display: block;
  margin-top: 8px;
  font-size: 20px;
}
.rental-actions {
  display: grid;
  gap: 8px;
}
@media (max-width: 750px) {
  .rental-card {
    grid-template-columns: 1fr;
  }
  .rental-card img {
    width: 100%;
    height: 210px;
  }
}
</style>
