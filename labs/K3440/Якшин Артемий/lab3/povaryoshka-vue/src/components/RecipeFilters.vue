<script setup>
// Фильтры поиска. Объект фильтров приходит через v-model из страницы поиска
const filters = defineModel({ type: Object, required: true })

defineEmits(['reset'])

const TYPES = ['Завтраки', 'Супы', 'Основные блюда', 'Выпечка и десерты']
const DIFFICULTIES = ['Легко', 'Средне', 'Сложно']
const TAGS = ['яйца', 'мука', 'молоко', 'сыр', 'мясо', 'овощи', 'фрукты', 'макароны', 'рис']
const TIMES = [
  { value: '', label: 'Любое' },
  { value: '15', label: 'До 15 минут' },
  { value: '30', label: 'До 30 минут' },
  { value: '60', label: 'До 1 часа' }
]
</script>

<template>
  <form class="filters w-100" aria-label="Фильтры рецептов" @submit.prevent>
    <fieldset class="filters__group">
      <legend class="filters__title">Тип блюда</legend>
      <div v-for="(type, index) in TYPES" :key="type" class="form-check">
        <input :id="`type${index}`" v-model="filters.type" class="form-check-input" type="checkbox" :value="type">
        <label class="form-check-label" :for="`type${index}`">{{ type }}</label>
      </div>
    </fieldset>

    <fieldset class="filters__group">
      <legend class="filters__title">Сложность</legend>
      <div class="tag-check">
        <template v-for="(level, index) in DIFFICULTIES" :key="level">
          <input :id="`diff${index}`" v-model="filters.difficulty" class="btn-check" type="checkbox" :value="level" autocomplete="off">
          <label class="btn" :for="`diff${index}`">{{ level }}</label>
        </template>
      </div>
    </fieldset>

    <fieldset class="filters__group">
      <legend class="filters__title">Ингредиенты</legend>
      <div class="tag-check">
        <template v-for="(tag, index) in TAGS" :key="tag">
          <input :id="`tag${index}`" v-model="filters.tags" class="btn-check" type="checkbox" :value="tag" autocomplete="off">
          <label class="btn" :for="`tag${index}`">{{ tag }}</label>
        </template>
      </div>
    </fieldset>

    <div class="filters__group">
      <label class="filters__title" for="timeSelect">Время приготовления</label>
      <select id="timeSelect" v-model="filters.time" class="form-select">
        <option v-for="time in TIMES" :key="time.value" :value="time.value">{{ time.label }}</option>
      </select>
    </div>

    <div class="filters__group d-grid gap-2">
      <button class="btn btn-accent d-lg-none" type="button" data-bs-dismiss="offcanvas" data-bs-target="#filtersPanel">Показать рецепты</button>
      <button class="btn btn-soft" type="button" @click="$emit('reset')">Сбросить фильтры</button>
    </div>
  </form>
</template>
