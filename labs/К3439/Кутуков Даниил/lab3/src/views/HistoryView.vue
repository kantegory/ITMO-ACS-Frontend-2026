<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { historyByDate } from '@lab1/catalog.js';
import { api } from '../api.js';
import BookingList from '../components/BookingList.vue';
import { useRequest } from '../composables/useRequest.js';

const route = useRoute();
const status = ref(route.query.created ? 'Столик забронирован.' : '');
const statusElement = ref(null);
const bookings = ref([]);
const restaurants = ref(new Map());
const { pending, failure, run } = useRequest({ authenticated: true });
const sorted = computed(() => historyByDate(bookings.value));

onMounted(() => run(() => Promise.all([api.getBookings(), api.list({})]), ([items, names]) => {
  bookings.value = items;
  restaurants.value = new Map(names.map(item => [item.id, item.name]));
  if (!items.length) status.value = 'Здесь появятся ваши бронирования.';
}));

async function cancel(id) {
  const done = await run(() => api.cancel(id), item => {
    bookings.value = bookings.value.map(booking => booking.id === id ? item : booking);
    status.value = 'Бронь отменена.';
  });
  if (done) {
    await nextTick();
    statusElement.value?.focus();
  }
}
</script>

<template>
  <RouterLink to="/" class="back-link">К ресторанам</RouterLink>
  <section class="history-panel">
    <h1>Мои брони</h1>
    <p ref="statusElement" tabindex="-1" role="status" class="muted">{{ pending ? 'Обновляем бронирования…' : status }}</p>
    <p v-if="failure" role="alert" class="error-text">{{ failure }}</p>
    <BookingList :bookings="sorted" :restaurants="restaurants" :pending="pending" @cancel="cancel" />
  </section>
</template>
