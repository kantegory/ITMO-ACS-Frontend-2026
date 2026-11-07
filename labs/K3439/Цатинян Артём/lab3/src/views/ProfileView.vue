<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";
import { useAsync } from "../composables/useAsync";
const auth = useAuthStore();
const router = useRouter();
const bookings = ref([]);
const restaurants = ref([]);
const { loading, error, run } = useAsync();
async function load() {
  const result = await run(() =>
    Promise.all([api.get("/bookings"), api.get("/restaurants")]),
  );
  if (result) [bookings.value, restaurants.value] = result;
}
function restaurant(id) {
  return restaurants.value.find((r) => r.id === id);
}
function isPast(booking) {
  return new Date(booking.date + "T" + booking.time) < new Date();
}
async function cancel(booking) {
  if (!confirm("Отменить бронирование?")) return;
  const result = await run(async () => {
    await api.delete(`/bookings/${encodeURIComponent(booking.id)}`);
    return true;
  });
  if (result)
    bookings.value = bookings.value.filter((b) => b.id !== booking.id);
}
async function logout() {
  await auth.logout();
  router.push("/");
}
onMounted(load);
</script>
<template>
  <main id="main-content" class="container py-5" tabindex="-1">
    <p class="eyebrow">Личный кабинет</p>
    <h1>Привет, {{ auth.user?.name }}</h1>
    <button class="btn btn-outline-dark mt-3" @click="logout">Выйти</button>
    <section class="mt-4">
      <h2>Мои бронирования</h2>
      <p v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
        <button class="btn btn-link" @click="load">Повторить</button>
      </p>
      <p v-if="loading" role="status">Загрузка...</p>
      <div
        v-else-if="!bookings.length && !error"
        class="bg-white rounded-4 p-4"
      >
        Пока нет бронирований. <RouterLink to="/">Выбрать ресторан</RouterLink>
      </div>
      <article
        v-for="booking in bookings"
        :key="booking.id"
        class="bg-white rounded-4 p-4 shadow-sm my-3"
      >
        <p class="eyebrow">
          {{ isPast(booking) ? "Прошедший визит" : "Ближайшая бронь" }}
        </p>
        <h2>{{ restaurant(booking.restaurantId)?.name || "Ресторан" }}</h2>
        <p class="text-secondary">
          {{ booking.date }} · {{ booking.time }} · Гостей:
          {{ booking.guests }} · {{ restaurant(booking.restaurantId)?.address }}
        </p>
        <template v-if="!isPast(booking)"
          ><RouterLink
            class="btn btn-outline-dark"
            :to="{
              name: 'restaurant',
              params: { id: booking.restaurantId },
              query: { edit: booking.id },
            }"
            >Изменить бронь</RouterLink
          >
          <button
            class="btn btn-outline-danger"
            :disabled="loading"
            @click="cancel(booking)"
          >
            Отменить
          </button>
        </template>
      </article>
    </section>
  </main>
</template>
