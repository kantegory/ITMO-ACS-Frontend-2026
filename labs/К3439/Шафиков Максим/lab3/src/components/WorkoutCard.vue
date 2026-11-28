<script setup>
import { photoUrl } from '../format.js';
import { workoutRoute } from '../router.js';
import WorkoutMeta from './WorkoutMeta.vue';

defineProps({ workout: { type: Object, required: true } });
</script>

<template>
  <article class="workout-card card">
    <RouterLink :to="workoutRoute(workout.id)" tabindex="-1" aria-hidden="true">
      <img :data-photo="workout.image" :src="photoUrl(workout.image)" alt="" width="512" height="512" loading="lazy">
    </RouterLink>
    <div class="card-body">
      <p class="category">{{ workout.type }}</p>
      <h3><RouterLink :to="workoutRoute(workout.id)">{{ workout.title }}</RouterLink></h3>
      <p>{{ workout.description }}</p>
      <WorkoutMeta :workout="workout" />
    </div>
  </article>
</template>
