<script setup>
import { reactive } from 'vue'

import { GUEST_OPTIONS, TIME_SLOTS } from '@/utils/booking'
import { todayISO } from '@/utils/format'

// Быстрый выбор даты, времени и числа гостей в сайдбаре — дальше открывается форма брони
const emit = defineEmits(['pick'])

const today = todayISO()
const choice = reactive({ date: today, time: '12:00', guests: 2 })

function onSubmit(event) {
  emit('pick', { ...choice }, event.submitter)
}
</script>

<template>
  <form class="row g-2 mb-3" @submit.prevent="onSubmit">
    <div class="col-12">
      <label class="form-label small" for="quickDate">Дата</label>
      <input id="quickDate" v-model="choice.date" class="form-control" type="date" :min="today" required>
    </div>
    <div class="col-6">
      <label class="form-label small" for="quickTime">Время</label>
      <select id="quickTime" v-model="choice.time" class="form-select">
        <option v-for="slot in TIME_SLOTS" :key="slot.time" :disabled="slot.busy">{{ slot.time }}</option>
      </select>
    </div>
    <div class="col-6">
      <label class="form-label small" for="quickGuests">Гостей</label>
      <select id="quickGuests" v-model.number="choice.guests" class="form-select">
        <option v-for="count in GUEST_OPTIONS" :key="count" :value="count">{{ count }}</option>
      </select>
    </div>
    <div class="col-12 d-grid mt-3">
      <button class="btn btn-primary" type="submit">Выбрать столик</button>
    </div>
  </form>
</template>
