<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatRating } from '@/utils/format'

// Плашка «★ 4.7». Звезда — картинка, поэтому смысл передаём через aria-label
defineProps({
  value: { type: Number, required: true },
  label: { type: String, required: true },
})
</script>

<template>
  <span class="rating-pill" role="img" :aria-label="label"><AppIcon class="icon-fill" name="star" />{{ formatRating(value) }}</span>
</template>
