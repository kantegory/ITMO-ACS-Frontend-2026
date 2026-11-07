<script setup>
import { computed } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { bookingGroup, bookingStatus } from '@/utils/booking'
import { assetUrl, formatDate, pluralGuests } from '@/utils/format'

const props = defineProps({
  booking: { type: Object, required: true },
})
const emit = defineEmits(['cancel'])

const group = computed(() => bookingGroup(props.booking))
const status = computed(() => bookingStatus(props.booking))
const page = computed(() => ({ name: 'restaurant', params: { id: props.booking.restaurantId } }))
const name = computed(() => props.booking.restaurant.name)
</script>

<template>
  <article class="booking-item" :data-status="group" :data-booking-id="booking.id">
    <img class="booking-thumb" :src="assetUrl(booking.restaurant.image)" alt="" width="96" height="96">
    <div class="booking-info">
      <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
        <h2 class="h5 mb-0"><RouterLink :to="page">{{ name }}</RouterLink></h2>
        <span class="badge" :class="status.badge">{{ status.label }}</span>
      </div>
      <ul class="meta-list">
        <li><AppIcon name="calendar" /><time :datetime="`${booking.date}T${booking.time}`">{{ formatDate(booking.date, { year: true }) }}, {{ booking.time }}</time></li>
        <li><AppIcon name="users" />{{ pluralGuests(booking.guests) }}</li>
        <li><AppIcon name="pin" />{{ booking.zone }}</li>
      </ul>
      <p v-if="booking.comment" class="small mb-0 mt-1">Пожелания: {{ booking.comment }}</p>
      <p class="small text-muted-warm mb-0 mt-1">Бронь № {{ booking.id }}</p>
    </div>
    <!-- Кнопки повторяются в каждой карточке, поэтому скринридеру дописываем, к какой брони они относятся -->
    <div class="booking-actions">
      <template v-if="group === 'upcoming'">
        <RouterLink class="btn btn-sm btn-outline-primary" :to="page">К ресторану<span class="visually-hidden"> «{{ name }}»</span></RouterLink>
        <button class="btn btn-sm btn-outline-danger" type="button" @click="emit('cancel', booking, $event.currentTarget)">
          Отменить<span class="visually-hidden"> бронь в «{{ name }}» на {{ formatDate(booking.date) }}, {{ booking.time }}</span>
        </button>
      </template>
      <template v-else-if="group === 'completed'">
        <RouterLink class="btn btn-sm btn-outline-primary" :to="{ ...page, hash: '#reviews' }">Оставить отзыв<span class="visually-hidden"> о «{{ name }}»</span></RouterLink>
        <RouterLink class="btn btn-sm btn-primary" :to="{ ...page, hash: '#booking' }">Повторить<span class="visually-hidden"> бронь в «{{ name }}»</span></RouterLink>
      </template>
      <RouterLink v-else class="btn btn-sm btn-outline-primary" :to="{ ...page, hash: '#booking' }">Забронировать снова<span class="visually-hidden"> в «{{ name }}»</span></RouterLink>
    </div>
  </article>
</template>
