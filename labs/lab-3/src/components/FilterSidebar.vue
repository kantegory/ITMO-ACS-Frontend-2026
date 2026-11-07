<script setup>
import { reactive } from "vue";

const props = defineProps({
  cuisines: { type: Array, default: () => [] },
  cities: { type: Array, default: () => [] }
});

const emit = defineEmits(["apply"]);

const filters = reactive({ name: "", cuisine: "", city: "", price: "" });

function submit() {
  emit("apply", { ...filters });
}

function reset() {
  filters.name = "";
  filters.cuisine = "";
  filters.city = "";
  filters.price = "";
  emit("apply", { ...filters });
}
</script>

<template>
  <div class="filter-sidebar">
    <h2 class="h5 mb-3">Фильтры</h2>
    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">Название</label>
        <input type="text" class="form-control" v-model="filters.name" placeholder="Например, Sakura">
      </div>
      <div class="mb-3">
        <label class="form-label">Кухня</label>
        <select class="form-select" v-model="filters.cuisine">
          <option value="">Любая</option>
          <option v-for="c in cuisines" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Расположение</label>
        <select class="form-select" v-model="filters.city">
          <option value="">Любое</option>
          <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Цена</label>
        <select class="form-select" v-model="filters.price">
          <option value="">Любая</option>
          <option value="1">$ — Бюджетно</option>
          <option value="2">$$ — Средне</option>
          <option value="3">$$$ — Дорого</option>
          <option value="4">$$$$ — Премиум</option>
        </select>
      </div>
      <button type="submit" class="btn btn-brand w-100">Применить</button>
      <button type="button" class="btn btn-outline-secondary w-100 mt-2" @click="reset">Сбросить</button>
    </form>
  </div>
</template>
