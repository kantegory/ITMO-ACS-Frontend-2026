<script setup>
import { TYPES, LEVELS } from '../constants.js'
defineProps({
  training: { type: Object, required: true },
  catalogQuery: { type: Object, default: () => ({}) }
})
</script>

<template>
  <article class="brutal-card h-100 d-flex flex-column">
    <div class="pose-art" :class="training.type" aria-hidden="true">
      <svg class="pose-svg" viewBox="0 0 200 120">
        <circle cx="100" cy="22" r="12" />
        <path d="M100 36v34M100 46 64 26M100 46l36-20M100 70 72 100M100 70l28 30M42 104h116" />
      </svg>
    </div>
    <div class="card-body d-flex flex-column flex-grow-1">
      <p class="eyebrow">{{ TYPES[training.type] }} · {{ training.minutes }} мин</p>
      <h2 class="h3">{{ training.title }}</h2>
      <p>{{ training.summary }}</p>
      <p class="small">Уровень: {{ LEVELS[training.level] }}</p>
      <RouterLink
          class="btn btn-brutal btn-lilac mt-auto"
          :to="{ name: 'training', params: { id: training.id }, query: catalogQuery }"
      >
        Подробнее
      </RouterLink>
    </div>
  </article>
</template>