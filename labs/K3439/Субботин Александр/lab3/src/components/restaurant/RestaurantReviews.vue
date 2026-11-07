<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'

import ReviewForm from '@/components/restaurant/ReviewForm.vue'
import ReviewItem from '@/components/restaurant/ReviewItem.vue'
import StarRating from '@/components/restaurant/StarRating.vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { formatRating, pluralize, pluralReviews, ratingOf } from '@/utils/format'

// Вкладка «Отзывы»: средняя оценка, распределение оценок, форма и список отзывов
const props = defineProps({
  restaurantId: { type: Number, required: true },
  reviews: { type: Array, required: true },
})
const emit = defineEmits(['created'])

const route = useRoute()
const { isLoggedIn } = useAuth()
const { showToast } = useToast()

const formOpen = ref(false)
const newReviewId = ref(null)

const sorted = computed(() => [...props.reviews].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id))
const rating = computed(() => ratingOf(props.reviews))

// Полоски — только картинка, скринридеру отдаём ту же информацию текстом
const bars = computed(() => [5, 4, 3, 2, 1].map((stars) => {
  const count = props.reviews.filter((review) => review.rating === stars).length
  const percent = rating.value.count ? Math.round((count / rating.value.count) * 100) : 0
  return { stars, percent, label: `${pluralize(stars, ['звезда', 'звезды', 'звёзд'])}: ${percent}% отзывов` }
}))

async function onCreated(review) {
  emit('created', review)
  newReviewId.value = review.id
  formOpen.value = false
  showToast('Спасибо! Отзыв опубликован.')
  // Форма свернулась вместе с кнопкой в фокусе — показываем пользователю его отзыв
  await nextTick()
  document.querySelector('.review-new')?.focus()
}
</script>

<template>
  <h2 class="visually-hidden">Отзывы</h2>
  <div class="reviews-summary row g-4 align-items-center mb-4">
    <div class="col-sm-4 text-center">
      <p class="rating-big mb-0" aria-hidden="true">{{ formatRating(rating.value) }}</p>
      <StarRating
        :value="rating.value"
        :label="rating.count ? `Средняя оценка ${formatRating(rating.value)} из 5` : 'Оценок пока нет'"
      />
      <p class="small text-muted-warm mb-0">{{ pluralReviews(rating.count) }}</p>
    </div>
    <div class="col-sm-8">
      <ul class="list-unstyled d-grid gap-1 mb-0" aria-label="Распределение оценок">
        <li v-for="bar in bars" :key="bar.stars" class="d-flex align-items-center gap-2 small">
          <span class="visually-hidden">{{ bar.label }}</span>
          <span class="text-nowrap" aria-hidden="true">{{ bar.stars }} ★</span>
          <div class="progress flex-grow-1" aria-hidden="true">
            <div class="progress-bar" :style="{ width: `${bar.percent}%` }"></div>
          </div>
          <span class="text-muted-warm bar-value" aria-hidden="true">{{ bar.percent }}%</span>
        </li>
      </ul>
    </div>
  </div>

  <template v-if="isLoggedIn">
    <button
      class="btn btn-outline-primary mb-3"
      type="button"
      aria-controls="reviewFormWrap"
      :aria-expanded="String(formOpen)"
      @click="formOpen = !formOpen"
    >
      Оставить отзыв
    </button>
    <div v-show="formOpen" id="reviewFormWrap">
      <ReviewForm :restaurant-id="restaurantId" @created="onCreated" />
    </div>
  </template>
  <p v-else class="alert alert-light border">
    Чтобы оставить отзыв, <RouterLink :to="{ name: 'login', query: { next: route.path } }">войдите в аккаунт</RouterLink>.
  </p>

  <div class="d-grid gap-3">
    <ReviewItem v-for="review in sorted" :key="review.id" :review="review" :is-new="review.id === newReviewId" />
    <p v-if="!sorted.length" class="text-muted-warm">Отзывов пока нет — станьте первым!</p>
  </div>
</template>
