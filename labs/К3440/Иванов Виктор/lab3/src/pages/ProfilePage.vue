<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useApi } from '../composables/useApi';
import { useAuth } from '../composables/useAuth';
const router = useRouter(), { api, message } = useApi(), auth = useAuth();
const profile = ref(null), bookings = ref([]), error = ref(''), loading = ref(true);
onMounted(async () => {
  try {
    profile.value = (await api.get('/auth/me')).data;
    bookings.value = (await api.get('/my-bookings')).data;
  } catch (e) {
    if (e.response?.status === 401) { auth.clearSession(); router.replace('/login'); }
    else error.value = message(e);
  } finally { loading.value = false; }
});
async function cancel(id) {
  error.value = '';
  try { await api.delete(`/my-bookings/${id}`); bookings.value = bookings.value.filter(b => b.id !== id); }
  catch (e) { error.value = message(e); }
}
async function logout() {
  try { await api.post('/auth/logout'); } catch {}
  auth.clearSession();
  router.push('/');
}
</script>
<template>
  <p v-if="loading" role="status">Загрузка профиля…</p>
  <p v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</p>
  <div v-if="profile">
    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><p class="eyebrow">Личный кабинет</p><h1 class="page-title">{{ profile.name }}</h1><p class="meta">{{ profile.email }}</p></div><button class="btn btn-outline-primary" type="button" @click="logout">Выйти</button></div>
    <section aria-labelledby="bookings-title"><h2 id="bookings-title" class="section-title">История бронирований</h2><p v-if="!bookings.length" class="empty">Пока нет бронирований. <RouterLink to="/">Найти ресторан</RouterLink></p><ul v-else class="list-group"><li v-for="booking in bookings" :key="booking.id" class="list-group-item d-flex justify-content-between align-items-center gap-3"><span><strong>{{ booking.restaurant }}</strong><br><small>{{ booking.date }} в {{ booking.time }} · гостей: {{ booking.guests }}</small></span><button class="btn btn-sm btn-outline-danger" type="button" :aria-label="`Отменить бронь в ${booking.restaurant}`" @click="cancel(booking.id)">Отменить</button></li></ul></section>
  </div>
</template>
