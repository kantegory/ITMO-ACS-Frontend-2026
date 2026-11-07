<script setup>
import StarRating from '@/components/restaurant/StarRating.vue'
import { formatDate, getInitials } from '@/utils/format'

defineProps({
  review: { type: Object, required: true },
  // Только что опубликованный отзыв подсвечивается, и на него переводится фокус
  isNew: { type: Boolean, default: false },
})
</script>

<template>
  <article class="review" :class="{ 'review-new': isNew }" :tabindex="isNew ? -1 : undefined">
    <div class="d-flex align-items-center gap-3 mb-2">
      <span class="avatar avatar-sm" aria-hidden="true">{{ getInitials(review.author) }}</span>
      <div>
        <h3 class="h6 mb-0">{{ review.author }}</h3>
        <time class="small text-muted-warm" :datetime="review.date">{{ formatDate(review.date, { year: true }) }}</time>
      </div>
      <span class="ms-auto"><StarRating :value="review.rating" /></span>
    </div>
    <p class="mb-0">{{ review.text }}</p>
  </article>
</template>
