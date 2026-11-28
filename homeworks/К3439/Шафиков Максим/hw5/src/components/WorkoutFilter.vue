<script setup lang="ts">
import { categories } from '../workouts'

const options = ['Все', ...categories] as const
const selection = defineModel<(typeof options)[number]>({ required: true })
</script>

<template>
  <div class="filters" role="group" aria-label="Категория тренировки">
    <button
      v-for="option in options"
      :key="option"
      type="button"
      :aria-pressed="selection === option"
      @click="selection = option"
    >
      {{ option }}
    </button>
  </div>
</template>
