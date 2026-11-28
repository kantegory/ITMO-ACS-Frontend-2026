<script setup>
import AppIcon from './AppIcon.vue';

const search = defineModel('search', { type: String, required: true });
const type = defineModel('type', { type: String, required: true });
const level = defineModel('level', { type: String, required: true });
const duration = defineModel('duration', { type: String, required: true });
</script>

<template>
  <form class="filter-bar row g-3" role="search" aria-label="Поиск тренировок" @submit.prevent>
    <div class="col-12 col-md-4">
      <label class="form-label" for="search"><AppIcon name="search" />Поиск</label>
      <input id="search" v-model="search" type="search" class="form-control" placeholder="Название или упражнение">
    </div>
    <div class="col-6 col-md">
      <label class="form-label" for="type">Тип</label>
      <select id="type" v-model="type" class="form-select">
        <option value="">Все типы</option>
        <option>Силовые</option>
        <option>Кардио</option>
        <option>Растяжка</option>
      </select>
    </div>
    <div class="col-6 col-md">
      <label class="form-label" for="level">Уровень</label>
      <select id="level" v-model="level" class="form-select">
        <option value="">Любой</option>
        <option>Начальный</option>
        <option>Средний</option>
      </select>
    </div>
    <div class="col-6 col-md">
      <label class="form-label" for="duration">Длительность</label>
      <select id="duration" v-model="duration" class="form-select">
        <option value="">Любая</option>
        <option value="short">До 15 мин</option>
        <option value="medium">16–25 мин</option>
        <option value="long">От 26 мин</option>
      </select>
    </div>
  </form>
</template>
