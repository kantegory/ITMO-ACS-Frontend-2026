<script setup>
defineProps({ sessions: { type: Array, required: true } });
const date = (value) =>
  new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
</script>
<template>
  <div class="dash-card history-list">
    <div v-for="session in sessions" :key="session.id" class="plan-row">
      <span class="plan-icon" aria-hidden="true">✓</span>
      <div>
        <RouterLink :to="'/workouts/' + session.workoutId">
          <b>{{ session.title }}</b>
        </RouterLink>
        <small>
          {{ date(session.completedAt) }} | {{ session.duration }} минут
        </small>
      </div>
      <span class="ms-auto">Завершена</span>
    </div>
    <p v-if="!sessions.length" class="empty-state">
      Завершённых тренировок пока нет.
    </p>
  </div>
</template>
