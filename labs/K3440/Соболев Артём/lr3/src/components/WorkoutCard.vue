<script setup>
defineProps({ workout: { type: Object, required: true } });
</script>
<template>
  <div class="col-md-6 col-lg-4">
    <RouterLink class="workout-card d-block" :to="'/workouts/' + workout.id">
      <div class="workout-info">
        <div>
          <span class="card-tag">
            {{ workout.category.toUpperCase() }} | {{ workout.duration }} МИН
          </span>
          <h2>{{ workout.title }}</h2>
          <p>{{ workout.level }} уровень | {{ workout.equipment }}</p>
        </div>
      </div>
    </RouterLink>
  </div>
</template>
