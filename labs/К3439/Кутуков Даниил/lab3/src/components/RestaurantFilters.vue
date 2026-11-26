<script setup>
import { cuisines, districts, priceOptions } from '@lab1/catalog.js';
import SiteIcon from './SiteIcon.vue';

const filters = defineModel({ type: Object, required: true });
function reset() { filters.value = { query: '', cuisine: '', district: '', price: '' }; }
</script>

<template>
  <form id="filters" class="filters panel" @submit.prevent @reset.prevent="reset">
    <div class="query-field">
      <label class="form-label" for="query">Поиск</label>
      <div class="input-with-icon"><SiteIcon name="search" /><input id="query" v-model="filters.query" name="query" type="search" class="form-control" placeholder="Название или адрес"></div>
    </div>
    <div>
      <label class="form-label" for="cuisine">Кухня</label>
      <select id="cuisine" v-model="filters.cuisine" class="form-select"><option value="">Любая кухня</option><option v-for="name in cuisines" :key="name">{{ name }}</option></select>
    </div>
    <div>
      <label class="form-label" for="district">Район</label>
      <select id="district" v-model="filters.district" class="form-select"><option value="">Все районы</option><option v-for="name in districts" :key="name">{{ name }}</option></select>
    </div>
    <div>
      <label class="form-label" for="price">Средний чек</label>
      <select id="price" v-model="filters.price" class="form-select"><option value="">Любой</option><option v-for="item in priceOptions" :key="item.value" :value="item.value">{{ item.label }}</option></select>
    </div>
    <button type="reset" class="btn btn-outline-primary">Сбросить</button>
  </form>
</template>
