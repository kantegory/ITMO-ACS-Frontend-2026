<script setup>
defineProps({ industries: { type: Array, required: true } });
const search = defineModel('search', { type: String, required: true });
const industry = defineModel('industry', { type: String, required: true });
</script>

<template>
  <form class="row g-3 align-items-end" role="search" aria-label="Поиск вакансий" @submit.prevent>
    <div class="col-md-7">
      <label class="form-label" for="search">Должность, компания или город</label>
      <input id="search" v-model.trim="search" class="form-control" type="search" placeholder="Например, аналитик">
    </div>
    <div class="col-md-5">
      <label class="form-label" for="industry">Отрасль</label>
      <select id="industry" v-model="industry" class="form-select">
        <option value="">Все отрасли</option>
        <option v-for="value in industries" :key="value" :value="value">{{ value }}</option>
      </select>
    </div>
  </form>
</template>
