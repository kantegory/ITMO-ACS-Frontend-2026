<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { formatPrice } from '@lab1/catalog.js';
import { api } from '../api.js';
import { photo } from '../assets.js';
import BookingDialog from '../components/BookingDialog.vue';
import SiteIcon from '../components/SiteIcon.vue';
import { useRequest } from '../composables/useRequest.js';
import { useSessionStore } from '../stores/session.js';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const restaurant = ref(null);
const dialog = ref(null);
const { pending, failure, run } = useRequest();
onMounted(() => run(() => api.getRestaurant(route.params.id), result => {
  restaurant.value = result;
  if (result) document.title = result.name + ' · Столик';
}));

function reserve() {
  if (session.user) dialog.value.open();
  else router.push({ name: 'login', query: { next: route.fullPath } });
}
</script>

<template>
  <RouterLink class="back-link" to="/">Все рестораны</RouterLink>
  <p v-if="pending" class="muted" role="status">Загружаем ресторан…</p>
  <p v-else-if="failure" class="error-text" role="alert">{{ failure }}</p>
  <h1 v-else-if="!restaurant">Ресторан не найден</h1>
  <article v-else>
    <div class="detail-top">
      <div>
        <p class="location"><SiteIcon name="pin" /> {{ restaurant.district }} район</p>
        <h1>{{ restaurant.name }}</h1>
        <p class="rating"><SiteIcon name="star" /> <span class="visually-hidden">Оценка из 5 </span>{{ restaurant.rating.toFixed(1).replace('.', ',') }} <span class="muted">· отзывов: {{ restaurant.reviewCount }}</span></p>
        <p>{{ restaurant.summary }}</p>
        <p class="muted">{{ restaurant.address }} · {{ restaurant.hours }}<br>Средний чек: {{ formatPrice(restaurant.price) }}</p>
        <button type="button" class="btn btn-primary" @click="reserve"><SiteIcon name="calendar" /> Забронировать столик</button>
      </div>
      <img :src="photo(restaurant.image)" :alt="restaurant.imageAlt" width="760" height="507">
    </div>
    <section class="detail-section" aria-labelledby="photos-title">
      <h2 id="photos-title">Фото</h2>
      <div class="detail-photos row g-3">
        <div class="col-sm-6"><img :src="photo('menu.jpg')" alt="Пример подачи блюда с зеленью и овощами" width="760" height="507" loading="lazy"></div>
        <div class="col-sm-6"><img :src="photo('room.jpg')" alt="Пример сервировки стола" width="760" height="507" loading="lazy"></div>
      </div>
    </section>
    <section class="detail-section" aria-labelledby="menu-title">
      <h2 id="menu-title">Меню</h2>
      <ul class="menu-list"><li v-for="dish in restaurant.menu" :key="dish.name"><span>{{ dish.name }}</span><strong>{{ formatPrice(dish.price) }}</strong></li></ul>
    </section>
    <section class="detail-section" aria-labelledby="reviews-title">
      <h2 id="reviews-title">Отзывы</h2>
      <ul class="review-list">
        <li v-for="review in restaurant.reviews" :key="review.author" class="panel">
          <strong>{{ review.author }}</strong> <span class="rating"><SiteIcon name="star" /> {{ review.rating }} из 5</span>
          <blockquote>{{ review.text }}</blockquote>
        </li>
      </ul>
    </section>
    <BookingDialog ref="dialog" :restaurant-id="restaurant.id" @booked="router.push({ name: 'history', query: { created: '1' } })" />
  </article>
</template>
