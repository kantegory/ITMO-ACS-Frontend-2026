<script setup>
import { displayDate } from '../format.js';
import { workoutRoute } from '../router.js';

defineProps({
  entries: { type: Array, required: true },
  planned: Boolean,
  pending: Boolean,
  emptyText: { type: String, required: true },
});
defineEmits(['complete', 'remove']);
</script>

<template>
  <ul v-if="entries.length" class="activity-list">
    <li v-for="entry in entries" :key="entry.id ?? entry.workout + ':' + entry.date">
      <div>
        <RouterLink v-if="entry.details" :to="workoutRoute(entry.workout)">{{ entry.details.title }}</RouterLink>
        <span v-else>Тренировка недоступна</span>
        <small>
          <time :datetime="entry.date">{{ displayDate(entry.date) }}</time>
          <template v-if="entry.details"> · {{ entry.details.minutes }} мин</template>
        </small>
      </div>
      <div v-if="planned" class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-secondary" type="button" :disabled="pending"
          @click="$emit('complete', entry.id)">Выполнено</button>
        <button class="btn btn-outline-secondary" type="button" :disabled="pending"
          @click="$emit('remove', entry.id)">Убрать</button>
      </div>
    </li>
  </ul>
  <p v-else class="empty">{{ emptyText }}</p>
</template>
