<script setup>
import AppIcon from "./AppIcon.vue";
import { useRestaurantDisplay } from "../composables/useRestaurantDisplay";

const props = defineProps({
  rating: { type: Number, required: true },
  // Звёзды — чисто декоративная иллюстрация рейтинга. Если рядом уже выводится
  // видимое числовое значение, звёзды скрываются от вспомогательных технологий,
  // иначе (например, в списке отзывов) им присваивается описательный aria-label.
  hideFromAt: { type: Boolean, default: true }
});

const { starsArray } = useRestaurantDisplay();
</script>

<template>
  <span
    class="rating-stars"
    :aria-hidden="hideFromAt ? 'true' : null"
    :aria-label="hideFromAt ? null : `Оценка: ${rating} из 5`"
  >
    <AppIcon
      v-for="(filled, i) in starsArray(rating)"
      :key="i"
      name="icon-star"
      class="rating-star"
      :class="filled ? 'rating-star-filled' : 'rating-star-empty'"
    />
  </span>
</template>
