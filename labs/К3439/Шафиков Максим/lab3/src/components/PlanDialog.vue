<script setup>
import { ref } from 'vue';
import { today } from '../format.js';

const props = defineProps({
  workouts: { type: Array, required: true },
  pending: Boolean,
  error: { type: String, default: '' },
});
const emit = defineEmits(['save', 'closed']);
const dialog = ref(null);
const selectedWorkout = ref('');
const date = ref('');

function open(workout) {
  selectedWorkout.value = workout ?? props.workouts[0]?.id ?? '';
  date.value = today();
  if (!dialog.value.open) dialog.value.showModal();
}

function close() {
  dialog.value?.close();
}

defineExpose({ open, close });
</script>

<template>
  <dialog ref="dialog" class="app-dialog" aria-labelledby="plan-title"
    @close="emit('closed')" @cancel="pending && $event.preventDefault()">
    <form @submit.prevent="emit('save', { workout: selectedWorkout, date })">
      <h2 id="plan-title">Добавить в план</h2>
      <div class="mb-3">
        <label class="form-label" for="planned-workout">Тренировка</label>
        <select id="planned-workout" v-model="selectedWorkout" class="form-select" required>
          <option v-for="workout in workouts" :key="workout.id" :value="workout.id">{{ workout.title }}</option>
        </select>
      </div>
      <div class="mb-4">
        <label class="form-label" for="plan-date">Дата</label>
        <input id="plan-date" v-model="date" class="form-control" type="date" :min="today()" required>
      </div>
      <p class="form-error" role="alert">{{ error }}</p>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-primary" type="submit" :disabled="pending">Добавить</button>
        <button class="btn btn-outline-secondary" type="button" :disabled="pending" @click="close">Отмена</button>
      </div>
    </form>
  </dialog>
</template>
