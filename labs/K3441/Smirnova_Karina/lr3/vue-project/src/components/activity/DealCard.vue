<script setup>
import { formatDate, formatPrice, getStatusData } from '@/utils/formatters'
defineProps({
  booking: { type: Object, required: true },
  currentUserId: { type: [Number, String], required: true },
})
defineEmits(['open-chat', 'cancel'])
</script>

<template>
  <article v-if="booking.listing" class="rs-card deal-card">
    <img :src="`/${booking.listing.image}`" :alt="booking.listing.title" />
    <div>
      <div class="d-flex gap-2">
        <span class="rs-badge badge-gray">{{
          Number(booking.listing.userId) === Number(currentUserId) ? 'Владелец' : 'Арендатор'
        }}</span>
        <span class="rs-muted"
          >{{ booking.listing.mode === 'DAILY' ? 'Посуточное бронирование' : 'Помесячная аренда' }}
        </span>
      </div>
      <h3>{{ booking.listing.title }}</h3>
      <p>{{ formatDate(booking.startDate) }} — {{ formatDate(booking.endDate) }}</p>
      <strong>{{ formatPrice(booking.total) }}</strong>
    </div>
    <div class="deal-actions">
      <span :class="['rs-badge', getStatusData(booking.status).className]">{{
        getStatusData(booking.status).text
      }}</span>
      <RouterLink
        class="btn btn-primary"
        :to="{ name: 'listing', params: { id: booking.listing.id } }"
        >Открыть объект
      </RouterLink>
      <button class="btn btn-primary" @click="$emit('open-chat')">Перейти в чат</button>
      <button v-if="booking.status === 'pending'" class="btn btn-danger" @click="$emit('cancel')">
        Отменить
      </button>
    </div>
  </article>
</template>

<style scoped>
.deal-card {
  display: grid;
  grid-template-columns: 180px 1fr auto;
  gap: 22px;
  padding: 18px;
  align-items: center;
}
.deal-card > img {
  width: 180px;
  height: 135px;
  object-fit: cover;
  border-radius: 10px;
}
.deal-card h3 {
  margin: 12px 0 5px;
  font-size: 20px;
}
.deal-actions {
  display: grid;
  justify-items: stretch;
  gap: 8px;
}
.deal-actions .rs-badge {
  text-align: center;
}
@media (max-width: 750px) {
  .deal-card {
    grid-template-columns: 1fr;
  }
  .deal-card > img {
    width: 100%;
    height: 220px;
  }
}
</style>
