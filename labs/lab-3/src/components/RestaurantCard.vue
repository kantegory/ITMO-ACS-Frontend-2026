<script setup>
import { useRouter } from "vue-router";
import StarRating from "./StarRating.vue";
import { useRestaurantDisplay } from "../composables/useRestaurantDisplay";

const props = defineProps({
  restaurant: { type: Object, required: true }
});

const router = useRouter();
const { priceSymbols } = useRestaurantDisplay();

function openRestaurant() {
  router.push(`/restaurants/${props.restaurant.id}`);
}
</script>

<template>
  <div class="col-md-6 col-xl-4">
    <div class="card h-100 restaurant-card" @click="openRestaurant">
      <img :src="restaurant.img" class="card-img-top" :alt="restaurant.name">
      <div class="card-body">
        <h5 class="card-title">{{ restaurant.name }}</h5>
        <p class="card-text text-muted mb-1">{{ restaurant.cuisine }} · {{ restaurant.city }}</p>
        <p class="card-text">
          <StarRating :rating="restaurant.rating" />
          <span class="text-muted">{{ restaurant.rating.toFixed(1) }}</span>
          <span class="price-tag float-end">{{ priceSymbols(restaurant.price) }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
