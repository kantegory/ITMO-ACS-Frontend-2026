<script setup>
import AppIcon from "./AppIcon.vue";
import StarRating from "./StarRating.vue";
import { useRestaurantDisplay } from "../composables/useRestaurantDisplay";

const props = defineProps({
  restaurant: { type: Object, required: true }
});

const { priceSymbols, priceLabel } = useRestaurantDisplay();
</script>

<template>
  <div class="col-md-6 col-xl-4">
    <router-link
      class="card h-100 restaurant-card text-decoration-none text-reset"
      :to="`/restaurants/${restaurant.id}`"
      :aria-label="`${restaurant.name}, ${restaurant.cuisine} кухня, ${restaurant.city}, рейтинг ${restaurant.rating.toFixed(1)} из 5, ${priceLabel(restaurant.price)}`"
    >
      <img :src="restaurant.img" class="card-img-top" alt="" aria-hidden="true">
      <div class="card-body">
        <h3 class="card-title h5">{{ restaurant.name }}</h3>
        <p class="card-text text-muted mb-1">
          <AppIcon name="icon-pin" /> {{ restaurant.cuisine }} · {{ restaurant.city }}
        </p>
        <p class="card-text">
          <StarRating :rating="restaurant.rating" />
          <span class="text-muted">{{ restaurant.rating.toFixed(1) }}</span>
          <span class="price-tag float-end">{{ priceSymbols(restaurant.price) }}</span>
        </p>
      </div>
    </router-link>
  </div>
</template>
