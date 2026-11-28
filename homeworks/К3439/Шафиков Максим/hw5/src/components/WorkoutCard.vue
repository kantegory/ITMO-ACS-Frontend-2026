<script setup lang="ts">
import type { Workout } from '../workouts'

defineProps<{ workout: Workout }>()
</script>

<template>
  <article class="workout-card">
    <div class="workout-image">
      <img :src="workout.image" alt="" width="640" height="380">
      <span class="workout-category">{{ workout.category }}</span>
    </div>
    <div class="workout-body">
      <h3>{{ workout.title }}</h3>
      <p>{{ workout.description }}</p>
      <ul class="workout-meta" aria-label="Параметры тренировки">
        <li>{{ workout.minutes }} мин</li>
        <li>{{ workout.level }} уровень</li>
      </ul>
    </div>
  </article>
</template>
