<script setup>
const filters = defineModel({ type: Object, required: true });
</script>
<template>
  <form class="filter-panel p-3 p-md-4 mb-4" role="search" @submit.prevent>
    <div class="row g-3">
      <div class="col-md-3"><label class="form-label" for="query">Название или описание</label><input id="query" v-model="filters.query" class="form-control" type="search"></div>
      <div class="col-md-3"><label class="form-label" for="cuisine">Кухня</label><select id="cuisine" v-model="filters.cuisine" class="form-select"><option value="">Любая</option><option>Европейская</option><option>Азиатская</option><option>Средиземноморская</option><option>Итальянская</option><option>Вегетарианская</option></select></div>
      <div class="col-md-3"><label class="form-label" for="district">Район</label><select id="district" v-model="filters.district" class="form-select"><option value="">Любой</option><option>Центр</option><option>Петроградская</option><option>Васильевский</option><option>Московский</option></select></div>
      <div class="col-md-3"><label class="form-label" for="price">Средний чек</label><select id="price" v-model.number="filters.price" class="form-select"><option :value="0">Любой</option><option :value="1">До 1000 ₽</option><option :value="2">До 2000 ₽</option><option :value="3">Любая цена</option></select></div>
    </div>
  </form>
</template>
