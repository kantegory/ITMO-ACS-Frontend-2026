<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "../components/AppIcon.vue";
import BookingModal from "../components/BookingModal.vue";
import StarRating from "../components/StarRating.vue";
import { useAsync } from "../composables/useAsync";
import { useRestaurantDisplay } from "../composables/useRestaurantDisplay";
import { fetchRestaurantById } from "../api/restaurants";

const route = useRoute();
const { priceSymbols, priceLabel } = useRestaurantDisplay();
const { data: restaurant, run } = useAsync(fetchRestaurantById);
const toastEl = ref(null);
const activeTab = ref("menu");

function showToast() {
  new window.bootstrap.Toast(toastEl.value).show();
}

onMounted(() => {
  run(route.params.id);
});
</script>

<template>
  <main class="container my-5" id="main-content">
    <div v-if="restaurant === null" class="alert-soft alert-soft-danger" role="alert" aria-live="assertive">
      <AppIcon name="icon-alert-circle" />
      Ресторан не найден. <router-link to="/">Вернуться к поиску</router-link>
    </div>

    <template v-else-if="restaurant">
      <div class="row g-4 mb-4">
        <div class="col-lg-7">
          <img :src="restaurant.img" class="img-fluid rounded w-100" style="max-height:380px;object-fit:cover;" :alt="`Интерьер ресторана «${restaurant.name}»`">
        </div>
        <div class="col-lg-5">
          <h1>{{ restaurant.name }}</h1>
          <p class="text-muted mb-1"><AppIcon name="icon-pin" /> {{ restaurant.cuisine }} кухня · {{ restaurant.city }}</p>
          <p>
            <StarRating :rating="restaurant.rating" class="fs-5" />
            <span class="text-muted">Рейтинг: {{ restaurant.rating.toFixed(1) }} из 5</span>
          </p>
          <p class="price-tag">Средний чек: <span :aria-label="priceLabel(restaurant.price)">{{ priceSymbols(restaurant.price) }}</span></p>
          <p>{{ restaurant.description }}</p>
          <button class="btn btn-brand btn-lg" data-bs-toggle="modal" data-bs-target="#bookingModal">Забронировать столик</button>
        </div>
      </div>

      <ul class="nav nav-tabs" id="infoTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'menu' }"
            id="tab-menu-btn"
            type="button"
            role="tab"
            aria-controls="tab-menu"
            :aria-selected="activeTab === 'menu' ? 'true' : 'false'"
            @click="activeTab = 'menu'"
          >Меню</button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'photos' }"
            id="tab-photos-btn"
            type="button"
            role="tab"
            aria-controls="tab-photos"
            :aria-selected="activeTab === 'photos' ? 'true' : 'false'"
            @click="activeTab = 'photos'"
          >Фото</button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'reviews' }"
            id="tab-reviews-btn"
            type="button"
            role="tab"
            aria-controls="tab-reviews"
            :aria-selected="activeTab === 'reviews' ? 'true' : 'false'"
            @click="activeTab = 'reviews'"
          >Отзывы</button>
        </li>
      </ul>

      <div class="tab-content border border-top-0 p-4 bg-white rounded-bottom">
        <div
          class="tab-pane fade"
          :class="{ 'show active': activeTab === 'menu' }"
          id="tab-menu"
          role="tabpanel"
          aria-labelledby="tab-menu-btn"
          tabindex="0"
        >
          <ul class="list-group">
            <li v-for="m in restaurant.menu" :key="m.name" class="list-group-item d-flex justify-content-between">
              <span>{{ m.name }}</span>
              <span class="fw-semibold">{{ m.price }} ₽</span>
            </li>
          </ul>
        </div>
        <div
          class="tab-pane fade"
          :class="{ 'show active': activeTab === 'photos' }"
          id="tab-photos"
          role="tabpanel"
          aria-labelledby="tab-photos-btn"
          tabindex="0"
        >
          <div class="row g-3">
            <div v-for="(p, i) in restaurant.photos" :key="p" class="col-md-4">
              <img :src="p" class="menu-photo w-100" :alt="`Фото ${i + 1} интерьера и блюд ресторана «${restaurant.name}»`">
            </div>
          </div>
        </div>
        <div
          class="tab-pane fade"
          :class="{ 'show active': activeTab === 'reviews' }"
          id="tab-reviews"
          role="tabpanel"
          aria-labelledby="tab-reviews-btn"
          tabindex="0"
        >
          <div v-for="rev in restaurant.reviews" :key="rev.author" class="review-card p-3 mb-3 border">
            <div class="d-flex justify-content-between">
              <strong>{{ rev.author }}</strong>
              <StarRating :rating="rev.rating" :hide-from-at="false" />
            </div>
            <p class="mb-0 mt-1">{{ rev.text }}</p>
          </div>
        </div>
      </div>

      <BookingModal :restaurant="restaurant" @booked="showToast" />

      <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div ref="toastEl" class="toast align-items-center alert-soft alert-soft-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex">
            <AppIcon name="icon-check-circle" class="ms-2 mt-2" />
            <div class="toast-body">Столик успешно забронирован! Подробности — в личном кабинете.</div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Закрыть уведомление"></button>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>
