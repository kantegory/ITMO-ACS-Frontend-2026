<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/client";
import { getLocalDate } from "../utils/date";
import { useAuthStore } from "../stores/auth";
import { useAsync } from "../composables/useAsync";
import SvgIcon from "../components/SvgIcon.vue";
const props = defineProps({ id: { type: String, required: true } });
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const item = ref(null);
const form = reactive({ date: "", time: "19:00", guests: 2 });
const times = ["12:00", "14:00", "16:00", "18:00", "19:00", "20:00", "21:00"];
const today = getLocalDate();
form.date =
  typeof route.query.date === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(route.query.date) &&
  route.query.date >= today
    ? route.query.date
    : today;
const requestedGuests = Number(route.query.guests);
if (
  Number.isInteger(requestedGuests) &&
  requestedGuests >= 1 &&
  requestedGuests <= 8
)
  form.guests = requestedGuests;
const { loading, error, run } = useAsync();
async function load() {
  const result = await run(async () => {
    const restaurant = await api.get(
      `/restaurants/${encodeURIComponent(props.id)}`,
    );
    let booking = null;
    if (route.query.edit)
      booking = await api.get(
        `/bookings/${encodeURIComponent(route.query.edit)}`,
      );
    return { restaurant, booking };
  });
  if (result) {
    item.value = result.restaurant;
    if (result.booking)
      Object.assign(form, {
        date: result.booking.date,
        time: result.booking.time,
        guests: result.booking.guests,
      });
  }
}
async function book() {
  if (!auth.user) {
    router.push({ name: "login", query: { redirect: route.fullPath } });
    return;
  }
  const result = await run(async () => {
    const payload = { ...form, restaurantId: props.id };
    if (route.query.edit)
      await api.patch(
        `/bookings/${encodeURIComponent(route.query.edit)}`,
        payload,
      );
    else await api.post("/bookings", payload);
    return true;
  });
  if (result) router.push("/profile");
}
onMounted(load);
watch(() => [props.id, route.query.edit], load);
</script>
<template>
  <main id="main-content" tabindex="-1">
    <div v-if="error && !item" class="container py-5">
      <p class="alert alert-danger" role="alert">{{ error }}</p>
      <button class="btn btn-outline-dark" @click="load">Повторить</button>
    </div>
    <p v-else-if="!item" class="container py-5" role="status">
      Загружаем ресторан...
    </p>
    <template v-else
      ><header class="hero py-5">
        <div class="container">
          <p class="eyebrow">{{ item.cuisine }} · {{ item.district }}</p>
          <h1>{{ item.name }}</h1>
          <p class="lead">{{ item.description }}</p>
        </div>
      </header>
      <div class="container py-5">
        <div class="row g-5">
          <section class="col-lg-7">
            <h2>О ресторане</h2>
            <p class="text-secondary">
              {{ item.description }} {{ item.address }} · Средний чек
              {{ item.price }} ₽
            </p>
            <h2 class="mt-5">Популярное меню</h2>
            <div class="border-bottom py-3">{{ item.dish }}</div>
            <h2 class="mt-5">Рейтинг</h2>
            <div class="bg-white rounded-4 p-3">
              <SvgIcon name="star" /> {{ item.rating }}
            </div>
          </section>
          <aside class="col-lg-5">
            <form
              class="bg-white rounded-4 p-4 shadow-sm"
              @submit.prevent="book"
            >
              <p class="eyebrow">Онлайн-бронирование</p>
              <h2>
                {{ route.query.edit ? "Изменить бронь" : "Выбрать столик" }}
              </h2>
              <label class="form-label mt-2" for="date">Дата</label>
              <input
                id="date"
                v-model="form.date"
                class="form-control border rounded p-2"
                type="date"
                :min="today"
                required
              />
              <label class="form-label mt-3" for="time">Время</label>
              <select
                id="time"
                v-model="form.time"
                class="form-select border rounded p-2"
              >
                <option v-for="time in times" :key="time">{{ time }}</option>
              </select>
              <label class="form-label mt-3" for="guests">Гостей</label>
              <select
                id="guests"
                v-model.number="form.guests"
                class="form-select border rounded p-2"
              >
                <option v-for="count in 8" :key="count" :value="count">
                  {{ count }}
                </option>
              </select>
              <p v-if="error" class="alert alert-danger mt-3" role="alert">
                {{ error }}
              </p>
              <button class="btn btn-accent w-100 mt-4" :disabled="loading">
                {{ route.query.edit ? "Сохранить изменения" : "Забронировать" }}
              </button>
            </form>
          </aside>
        </div>
      </div></template
    >
  </main>
</template>
