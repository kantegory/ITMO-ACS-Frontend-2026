<script setup>
import { computed } from 'vue'

import PriceLevel from '@/components/restaurant/PriceLevel.vue'
import RatingPill from '@/components/restaurant/RatingPill.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { assetUrl, formatMoney, ratingLabel, ratingOf } from '@/utils/format'

// Карточка ресторана для главной и поиска. restaurant — с _expand=cuisine&_expand=district&_embed=reviews
const props = defineProps({
  restaurant: { type: Object, required: true },
  // На главной карточки внутри раздела с h2, в поиске — сразу под h1
  heading: { type: String, default: 'h2' },
})

const rating = computed(() => ratingOf(props.restaurant.reviews))
const page = computed(() => ({ name: 'restaurant', params: { id: props.restaurant.id } }))
</script>

<template>
  <article class="card restaurant-card">
    <div class="card-cover">
      <img class="card-img-top" :src="assetUrl(restaurant.image)" :alt="restaurant.imageAlt">
      <span class="badge badge-cuisine">{{ restaurant.cuisine?.name }}</span>
    </div>
    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
        <component :is="heading" class="card-title h5 mb-0">
          <RouterLink :to="page">{{ restaurant.name }}</RouterLink>
        </component>
        <RatingPill :value="rating.value" :label="ratingLabel(rating)" />
      </div>
      <ul class="meta-list mb-3">
        <li><AppIcon name="pin" />{{ restaurant.district?.name }}</li>
        <li>
          <PriceLevel :level="restaurant.priceLevel" />
          <!-- «~» читается как «тильда» — вслух говорим «средний чек около …» -->
          <span><span aria-hidden="true">~</span><span class="visually-hidden">средний чек около </span>{{ formatMoney(restaurant.avgCheck) }}</span>
        </li>
      </ul>
      <p class="card-text text-muted-warm small">{{ restaurant.short }}</p>
      <RouterLink class="btn btn-outline-primary mt-auto" :to="{ ...page, hash: '#booking' }">
        Забронировать<span class="visually-hidden"> столик в «{{ restaurant.name }}»</span>
      </RouterLink>
    </div>
  </article>
</template>
