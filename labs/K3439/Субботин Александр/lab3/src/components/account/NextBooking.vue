<script setup>
import { computed } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { BOOKING_STATUS } from '@/utils/booking'
import { assetUrl, formatDate, pluralGuests } from '@/utils/format'

const props = defineProps({
  booking: { type: Object, required: true },
})

const status = computed(() => BOOKING_STATUS[props.booking.status])
const page = computed(() => ({ name: 'restaurant', params: { id: props.booking.restaurantId } }))
</script>

<template>
  <div class="next-booking">
    <img :src="assetUrl(booking.restaurant.image)" alt="" width="160" height="120">
    <div>
      <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
        <h3 class="h5 mb-0"><RouterLink :to="page">{{ booking.restaurant.name }}</RouterLink></h3>
        <span class="badge" :class="status.badge">{{ status.label }}</span>
      </div>
      <ul class="meta-list mb-3">
        <li><AppIcon name="calendar" /><time :datetime="`${booking.date}T${booking.time}`">{{ formatDate(booking.date, { year: true }) }}, {{ booking.time }}</time></li>
        <li><AppIcon name="users" />{{ pluralGuests(booking.guests) }}</li>
        <li><AppIcon name="pin" />{{ booking.restaurant.address }}</li>
      </ul>
      <div class="d-flex flex-wrap gap-2">
        <RouterLink class="btn btn-sm btn-primary" :to="page">Страница ресторана</RouterLink>
        <RouterLink class="btn btn-sm btn-outline-primary" :to="{ name: 'bookings' }">Управлять бронью</RouterLink>
      </div>
    </div>
  </div>
</template>
