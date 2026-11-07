<script setup>
import SvgIcon from "./SvgIcon.vue";
defineProps({
  restaurant: { type: Object, required: true },
  date: { type: String, default: "" },
  guests: { type: Number, default: 2 },
});
const photos = [
  "photo-1515003197210-e0cd71810b5f",
  "photo-1579871494447-9811cf80d66c",
  "photo-1547592180-85f173990554",
  "photo-1512621776951-a57141f2eefd",
  "photo-1513104890138-7c749659a591",
  "photo-1544025162-d76694265947",
];
</script>
<template>
  <article class="col-md-6 col-xl-4">
    <div class="restaurant-card">
      <img
        :src="`https://images.unsplash.com/${photos[(Number(restaurant.id) - 1) % photos.length]}?auto=format&fit=crop&w=900&q=80`"
        alt=""
      />
      <div class="p-3">
        <div class="d-flex justify-content-between">
          <h3>{{ restaurant.name }}</h3>
          <span class="rating"
            ><SvgIcon name="star" /><span class="visually-hidden"
              >Рейтинг:
            </span>
            {{ restaurant.rating }}</span
          >
        </div>
        <p>
          {{ restaurant.cuisine }} · {{ restaurant.district }} ·
          {{ restaurant.price }} ₽
        </p>
        <RouterLink
          class="stretched-link"
          :to="{
            name: 'restaurant',
            params: { id: restaurant.id },
            query: { date, guests },
          }"
          :aria-label="`Открыть ресторан ${restaurant.name}`"
          >Открыть ресторан</RouterLink
        >
      </div>
    </div>
  </article>
</template>
