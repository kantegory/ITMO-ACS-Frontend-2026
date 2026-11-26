<script setup>
import { reactive, ref } from 'vue';
import { times, today } from '@lab1/catalog.js';
import { api } from '../api.js';
import { useRequest } from '../composables/useRequest.js';

const props = defineProps({ restaurantId: { type: Number, required: true } });
const emit = defineEmits(['booked']);
const dialog = ref(null);
const alert = ref(null);
const form = reactive({ date: today(), time: times.at(-1), guests: 2 });
const { pending, failure, run } = useRequest({ authenticated: true });

function open() {
  if (pending.value) return;
  failure.value = '';
  dialog.value.showModal();
}

defineExpose({ open });

async function submit() {
  const done = await run(() => api.book({ ...form, restaurantId: props.restaurantId }), () => {
    dialog.value.close();
    emit('booked');
  });
  if (!done) alert.value?.focus();
}
</script>

<template>
  <dialog ref="dialog" class="booking-dialog" aria-labelledby="booking-heading" aria-describedby="booking-help" @cancel="pending && $event.preventDefault()">
    <div class="section-heading">
      <h2 id="booking-heading">Забронировать столик</h2>
      <button type="button" class="btn btn-outline-primary" :disabled="pending" @click="dialog.close()">Закрыть</button>
    </div>
    <p id="booking-help" class="muted mb-0 mt-2">Укажите дату, время и число гостей от 1 до 8.</p>
    <form class="form-stack" @submit.prevent="submit">
      <label class="form-label" for="date">Дата</label>
      <input id="date" v-model="form.date" type="date" class="form-control" :min="today()" required autofocus>
      <label class="form-label" for="time">Время</label>
      <select id="time" v-model="form.time" class="form-select"><option v-for="time in times" :key="time">{{ time }}</option></select>
      <label class="form-label" for="guests">Гостей</label>
      <input id="guests" v-model.number="form.guests" type="number" class="form-control" min="1" max="8" required>
      <p v-if="failure" ref="alert" role="alert" tabindex="-1" class="error-text mb-0">{{ failure }}</p>
      <button type="submit" class="btn btn-primary" :disabled="pending">Подтвердить бронь</button>
    </form>
  </dialog>
</template>
