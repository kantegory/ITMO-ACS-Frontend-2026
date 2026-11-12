<script setup>
import { ref, onMounted, watch } from 'vue';
import { Modal } from 'bootstrap';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useApi } from '../composables/useApi';
import { useAuth } from '../composables/useAuth';
const route = useRoute(), router = useRouter();
const { api, message } = useApi(), auth = useAuth();
const restaurant = ref(null), error = ref(''), status = ref('');
const booking = ref({ date: '', time: '19:00', guests: 2 });
const photoUrls = ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=80", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1100&q=80", "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1100&q=80", "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1100&q=80", "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=1100&q=80", "https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&w=1100&q=80"];
const today = new Date().toISOString().slice(0,10);
async function load() { restaurant.value = null; error.value = ''; try { restaurant.value = (await api.get(`/restaurants/${route.params.id}`)).data; document.title = `${restaurant.value.name} — Столик`; } catch (e) { error.value = message(e); } }
onMounted(load);
watch(() => route.params.id, load);
async function book() {
  status.value = '';
  if (!auth.user.value) { Modal.getInstance(document.getElementById('booking-modal'))?.hide(); return router.push('/login'); }
  try { await api.post('/my-bookings', { restaurantId: restaurant.value.id, ...booking.value }); status.value = 'Столик забронирован. Подробности в личном кабинете.'; }
  catch (e) { status.value = message(e); }
}
</script>
<template>
  <p v-if="error" class="alert alert-danger" role="alert">{{ error }}. <RouterLink to="/">К поиску</RouterLink></p>
  <p v-else-if="!restaurant" role="status">Загрузка ресторана…</p>
  <template v-else>
    <nav aria-label="Хлебные крошки"><ol class="breadcrumb"><li class="breadcrumb-item"><RouterLink to="/">Рестораны</RouterLink></li><li class="breadcrumb-item active" aria-current="page">{{ restaurant.name }}</li></ol></nav>
    <div class="row g-4"><div class="col-lg-6"><img class="detail-art" :src="photoUrls[(restaurant.id-1)%photoUrls.length]" alt="Иллюстративная фотография интерьера" loading="lazy"></div><div class="col-lg-6"><p class="eyebrow">{{ restaurant.cuisine }} · {{ restaurant.district }}</p><h1 class="page-title">{{ restaurant.name }}</h1><p :aria-label="`Рейтинг ${restaurant.rating} из 5`">★ {{ restaurant.rating }} / 5</p><p>{{ restaurant.description }}</p><p><strong>Адрес:</strong> {{ restaurant.address }}<br><strong>Время работы:</strong> {{ restaurant.hours }}</p><button class="btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#booking-modal">Забронировать столик</button></div></div>
    <section class="mt-5" aria-labelledby="photos-title"><h2 id="photos-title" class="section-title">Фотографии</h2><img class="restaurant-photo" :src="photoUrls[(restaurant.id+2)%photoUrls.length]" alt="Иллюстративная фотография интерьера" loading="lazy"></section>
    <section class="mt-5" aria-labelledby="menu-title"><h2 id="menu-title" class="section-title">Популярное в меню</h2><ul class="list-group"><li v-for="[name, price] in restaurant.menu" :key="name" class="list-group-item d-flex justify-content-between"><span>{{ name }}</span><strong>{{ price }}</strong></li></ul></section>
    <section class="mt-5" aria-labelledby="reviews-title"><h2 id="reviews-title" class="section-title">Отзывы</h2><div class="review"><strong>Анна</strong> · ★★★★★<p>Уютное место и внимательный персонал. Вернёмся ещё!</p></div><div class="review"><strong>Михаил</strong> · ★★★★☆<p>Вкусно, столик подготовили к нашему приходу.</p></div></section>
    <div id="booking-modal" class="modal fade" tabindex="-1" aria-labelledby="booking-title" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h2 id="booking-title" class="modal-title fs-5">Забронировать столик</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button></div><div class="modal-body"><form @submit.prevent="book"><div class="mb-3"><label class="form-label" for="date">Дата</label><input id="date" v-model="booking.date" class="form-control" type="date" :min="today" required></div><div class="mb-3"><label class="form-label" for="time">Время</label><input id="time" v-model="booking.time" class="form-control" type="time" required></div><div class="mb-3"><label class="form-label" for="guests">Количество гостей</label><select id="guests" v-model.number="booking.guests" class="form-select"><option v-for="n in 6" :key="n" :value="n">{{ n }}</option></select></div><p class="status" role="status" aria-live="polite">{{ status }}</p><button class="btn btn-primary" type="submit">Подтвердить бронь</button></form></div></div></div></div>
  </template>
</template>
