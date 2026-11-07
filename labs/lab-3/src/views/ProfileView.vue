<script setup>
import { onMounted } from "vue";
import BookingHistoryItem from "../components/BookingHistoryItem.vue";
import { useAuth } from "../composables/useAuth";
import { useAsync } from "../composables/useAsync";
import { fetchBookings, cancelBooking } from "../api/bookings";

const { user } = useAuth();
const { data: bookings, error, run } = useAsync(fetchBookings);

async function loadBookings() {
  await run().catch(() => {});
}

async function handleCancel(id) {
  try {
    await cancelBooking(id);
    await loadBookings();
  } catch (err) {
    alert("Не удалось отменить бронирование.");
  }
}

onMounted(() => {
  if (user.value) loadBookings();
});
</script>

<template>
  <main class="container my-5">
    <div v-if="!user" class="alert alert-info text-center">
      Чтобы увидеть личный кабинет, пожалуйста, <router-link to="/login">войдите</router-link> или
      <router-link to="/register">зарегистрируйтесь</router-link>.
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body text-center">
            <h1 class="h5 card-title">{{ user.name }}</h1>
            <p class="text-muted mb-0">{{ user.email }}</p>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <h2 class="h4 mb-3">История бронирований</h2>
        <div v-if="error" class="alert alert-danger">
          Не удалось загрузить бронирования. Проверьте, что запущен мок-сервер API, и попробуйте войти снова.
        </div>
        <template v-else>
          <BookingHistoryItem
            v-for="b in bookings"
            :key="b.id"
            :booking="b"
            @cancel="handleCancel"
          />
          <p v-if="bookings && bookings.length === 0" class="text-muted">
            У вас пока нет бронирований. <router-link to="/">Найти ресторан</router-link>
          </p>
        </template>
      </div>
    </div>
  </main>
</template>
