<script setup>
import { experiences, formats, industries } from '../domain.js';
import SiteIcon from './SiteIcon.vue';

const filters = defineModel({ type: Object, required: true });
defineEmits(['clear']);
</script>

<template>
  <form class="panel p-3 p-md-4" aria-labelledby="filters-title" @submit.prevent>
    <h2 class="h5 mb-3" id="filters-title"><SiteIcon name="filter" /> Фильтры</h2>
    <label class="form-label" for="industry">Отрасль</label>
    <select v-model="filters.industry" class="form-select mb-3" id="industry">
      <option value="">Все отрасли</option>
      <option v-for="value in industries" :key="value">{{ value }}</option>
    </select>
    <label class="form-label" for="experience">Опыт</label>
    <select v-model="filters.experience" class="form-select mb-3" id="experience">
      <option value="">Любой опыт</option>
      <option v-for="value in experiences" :key="value">{{ value }}</option>
    </select>
    <label class="form-label" for="minimum">Зарплата от, ₽</label>
    <input v-model.number="filters.minimum" class="form-control" type="number" id="minimum" min="0"
      inputmode="numeric" aria-describedby="salary-hint" @change="$event.target.reportValidity()">
    <p class="form-text mb-3" id="salary-hint">Покажем варианты, где верхняя граница зарплаты не ниже этой суммы.</p>
    <label class="form-label" for="format">Формат работы</label>
    <select v-model="filters.format" class="form-select mb-3" id="format">
      <option value="">Любой формат</option>
      <option v-for="value in formats" :key="value">{{ value }}</option>
    </select>
    <button class="btn btn-outline-secondary w-100" type="button" @click="$emit('clear')">Сбросить</button>
  </form>
</template>
