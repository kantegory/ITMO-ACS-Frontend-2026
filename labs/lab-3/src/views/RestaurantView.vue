<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import BookingModal from "../components/BookingModal.vue";
import StarRating from "../components/StarRating.vue";
import { useAsync } from "../composables/useAsync";
import { useRestaurantDisplay } from "../composables/useRestaurantDisplay";
import { fetchRestaurantById } from "../api/restaurants";

const route = useRoute();
const { priceSymbols } = useRestaurantDisplay();
const { data: restaurant, run } = useAsync(fetchRestaurantById);
const toastEl = ref(null);

function showToast() {
  new window.bootstrap.Toast(toastEl.value).show();
}

onMounted(() => {
  run(route.params.id);
});
</script>

<template>
  <main class="container my-5">
    <div v-if="restaurant === null" class="alert alert-danger">
      Ресторан не найден. <router-link to="/">Вернуться к поиску</router-link>
    </div>

    <template v-else-if="restaurant">
      <div class="row g-4 mb-4">
        <div class="col-lg-7">
          <img :src="restaurant.img" class="img-fluid rounded w-100" style="max-height:380px;object-fit:cover;" :alt="restaurant.name">
        </div>
        <div class="col-lg-5">
          <h1>{{ restaurant.name }}</h1>
          <p class="text-muted mb-1">{{ restaurant.cuisine }} кухня · {{ restaurant.city }}</p>
          <p><StarRating :rating="restaurant.rating" class="fs-5" /> <span class="text-muted">{{ restaurant.rating.toFixed(1) }} / 5</span></p>
          <p class="price-tag">Средний чек: {{ priceSymbols(restaurant.price) }}</p>
          <p>{{ restaurant.description }}</p>
          <button class="btn btn-brand btn-lg" data-bs-toggle="modal" data-bs-target="#bookingModal">Забронировать столик</button>
        </div>
      </div>

      <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-menu" type="button">Меню</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-photos" type="button">Фото</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-reviews" type="button">Отзывы</button></li>
      </ul>

      <div class="tab-content border border-top-0 p-4 bg-white rounded-bottom">
        <div class="tab-pane fade show active" id="tab-menu">
          <ul class="list-group">
            <li v-for="m in restaurant.menu" :key="m.name" class="list-group-item d-flex justify-content-between">
              <span>{{ m.name }}</span>
              <span class="fw-semibold">{{ m.price }} ₽</span>
            </li>
          </ul>
        </div>
        <div class="tab-pane fade" id="tab-photos">
          <div class="row g-3">
            <div v-for="p in restaurant.photos" :key="p" class="col-md-4">
              <img :src="p" class="menu-photo w-100" :alt="`Фото ${restaurant.name}`">
            </div>
          </div>
        </div>
        <div class="tab-pane fade" id="tab-reviews">
          <div v-for="rev in restaurant.reviews" :key="rev.author" class="review-card p-3 mb-3 border">
            <div class="d-flex justify-content-between">
              <strong>{{ rev.author }}</strong>
              <StarRating :rating="rev.rating" />
            </div>
            <p class="mb-0 mt-1">{{ rev.text }}</p>
          </div>
        </div>
      </div>

      <BookingModal :restaurant="restaurant" @booked="showToast" />

      <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div ref="toastEl" class="toast align-items-center text-bg-success border-0" role="alert">
          <div class="d-flex">
            <div class="toast-body">Столик успешно забронирован! Подробности — в личном кабинете.</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>
