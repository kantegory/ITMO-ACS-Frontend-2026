<script setup>
import { TYPE_NAMES } from '../format'

defineProps({ pending: Boolean })
const filters = defineModel({ type: Object, required: true })
const emit = defineEmits(['search', 'reset'])
</script>

<template>
  <aside class="col-lg-3" aria-label="Фильтры">
    <form class="card card-body gap-2" @submit.prevent="emit('search')">
      <label for="type">Тип</label>
      <select id="type" v-model="filters.type" class="form-select">
        <option value="">Все</option>
        <option v-for="(title, type) in TYPE_NAMES" :key="type" :value="type">{{ title }}</option>
      </select>
      <label for="city">Город</label>
      <input id="city" v-model="filters.city" class="form-control">
      <fieldset>
        <legend class="fs-6">Цена, ₽/мес</legend>
        <label for="min">От</label>
        <input id="min" v-model.number="filters.min" type="number" min="0" class="form-control mb-2">
        <label for="max">До</label>
        <input id="max" v-model.number="filters.max" type="number" min="0" class="form-control">
      </fieldset>
      <button class="btn btn-primary" :disabled="pending">Найти</button>
      <button type="button" class="btn btn-outline-secondary" :disabled="pending" @click="emit('reset')">Сбросить</button>
    </form>
  </aside>
</template>
