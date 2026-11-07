<script setup>
import { useRestaurantDisplay } from "../composables/useRestaurantDisplay";

const props = defineProps({
  rating: { type: Number, required: true }
});

const { starsArray } = useRestaurantDisplay();
</script>

<template>
  <span class="rating-stars">
    <span v-for="(filled, i) in starsArray(rating)" :key="i">{{ filled ? "★" : "☆" }}</span>
  </span>
</template>
