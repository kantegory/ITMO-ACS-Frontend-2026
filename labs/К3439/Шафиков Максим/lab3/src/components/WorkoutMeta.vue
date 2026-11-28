<script setup>
defineProps({ workout: { type: Object, required: true } });
</script>

<template>
  <div class="workout-meta">
    <span>{{ workout.level }}</span>
    <span>{{ workout.minutes }} мин</span>
  </div>
</template>
