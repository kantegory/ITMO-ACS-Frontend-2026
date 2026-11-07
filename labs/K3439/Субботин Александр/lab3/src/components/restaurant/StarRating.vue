<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

// Пять звёзд для оценки отзыва или средней оценки ресторана
const props = defineProps({
  value: { type: Number, required: true },
  label: { type: String, default: '' },
})
</script>

<template>
  <span class="stars" role="img" :aria-label="label || `Оценка ${props.value} из 5`">
    <AppIcon
      v-for="star in 5"
      :key="star"
      class="icon-fill"
      :class="star <= Math.round(value) ? 'star-on' : 'star-off'"
      name="star"
    />
  </span>
</template>
