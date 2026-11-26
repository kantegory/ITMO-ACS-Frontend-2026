<script setup>
import { RouterLink } from 'vue-router';
import { formatDate } from '@lab1/catalog.js';

defineProps({
  bookings: { type: Array, required: true },
  restaurants: { type: Object, required: true },
  pending: Boolean,
});
const emit = defineEmits(['cancel']);

function isUpcoming(booking) {
  return new Date(booking.date + 'T' + booking.time) > new Date();
}

function status(booking) {
  if (booking.cancelled) return 'Отменено';
  return isUpcoming(booking) ? 'Подтверждено' : 'Завершено';
}
</script>

<template>
  <ul class="booking-list">
    <li v-for="booking in bookings" :key="booking.id" class="panel">
      <div>
        <h2><RouterLink :to="{ name: 'restaurant', params: { id: booking.restaurantId } }">{{ restaurants.get(booking.restaurantId) ?? 'Ресторан' }}</RouterLink></h2>
        <p class="muted mb-0"><time :datetime="booking.date + 'T' + booking.time">{{ formatDate(booking.date) }}, {{ booking.time }}</time> · гостей: {{ booking.guests }}</p>
      </div>
      <div class="action-row">
        <span class="booking-status">{{ status(booking) }}</span>
        <button v-if="!booking.cancelled && isUpcoming(booking)" type="button" class="btn btn-outline-primary"
                :disabled="pending" @click="emit('cancel', booking.id)">Отменить бронь</button>
      </div>
    </li>
  </ul>
</template>
