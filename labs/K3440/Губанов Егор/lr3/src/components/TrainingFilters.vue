<script setup>
import { computed, ref } from 'vue'
import { TYPES, LEVELS } from '../constants.js'

const model = defineModel({ type: Object, required: true })
const emit = defineEmits(['submit'])
const expanded = ref(false)

const activeCount = computed(() =>
    [model.value.type, model.value.level, model.value.maxMinutes].filter(Boolean).length
)

function update(field, value) {
  model.value = { ...model.value, [field]: value }
}
</script>

<template>
  <form class="filter-panel catalog-filter my-3" role="search" @submit.prevent="emit('submit')">
    <label class="form-label" for="searchFilter">Поиск</label>
    <div class="d-flex flex-wrap gap-2">
      <input id="searchFilter" class="form-control catalog-search" type="search"
             placeholder="Например, корпус" :value="model.search"
             @input="update('search', $event.target.value)">
      <button class="btn btn-brutal btn-sage" type="submit">Найти</button>
    </div>

    <button class="btn btn-brutal btn-paper catalog-filter-toggle mt-3" type="button"
            :aria-expanded="expanded" aria-controls="catalogExtraFilters" @click="expanded = !expanded">
      Фильтры{{ activeCount ? ` (${activeCount})` : '' }}
    </button>

    <div id="catalogExtraFilters" class="catalog-extra row g-2 mt-2" :class="{ 'is-open': expanded }">
      <div class="col-12 col-md-4">
        <label class="form-label" for="typeFilter">Направление</label>
        <select id="typeFilter" class="form-select" :value="model.type" @change="update('type', $event.target.value)">
          <option value="">Все направления</option>
          <option v-for="(title, key) in TYPES" :key="key" :value="key">{{ title }}</option>
        </select>
      </div>

      <div class="col-12 col-md-4">
        <label class="form-label" for="levelFilter">Уровень</label>
        <select id="levelFilter" class="form-select" :value="model.level" @change="update('level', $event.target.value)">
          <option value="">Любой</option>
          <option v-for="(title, key) in LEVELS" :key="key" :value="key">{{ title }}</option>
        </select>
      </div>

      <div class="col-12 col-md-4">
        <label class="form-label" for="durationFilter">Длительность</label>
        <select id="durationFilter" class="form-select" :value="model.maxMinutes"
                @change="update('maxMinutes', $event.target.value)">
          <option value="">Любая</option>
          <option value="15">До 15 минут</option>
          <option value="20">До 20 минут</option>
          <option value="30">До 30 минут</option>
        </select>
      </div>
    </div>
  </form>
</template>