<template>
  <form class="filters" role="search" aria-label="Фильтры рецептов" @submit.prevent>
    <div class="mb-3">
      <label for="query" class="form-label fw-medium">Название</label>
      <input
        id="query"
        v-model="filters.q"
        type="search"
        class="form-control"
        placeholder="Например, суп"
      />
    </div>

    <div class="mb-3">
      <label for="dishType" class="form-label fw-medium">Тип блюда</label>
      <select id="dishType" v-model="filters.type" class="form-select">
        <option value="">Любой</option>
        <option v-for="type in DISH_TYPES" :key="type" :value="type">{{ type }}</option>
      </select>
    </div>

    <fieldset class="mb-3">
      <legend class="form-label fw-medium fs-6">Сложность</legend>
      <div v-for="(item, index) in DIFFICULTIES" :key="item" class="form-check">
        <input
          :id="`difficulty${index}`"
          v-model="filters.difficulty"
          class="form-check-input"
          type="checkbox"
          :value="item"
        />
        <label class="form-check-label" :for="`difficulty${index}`">{{ item }}</label>
      </div>
    </fieldset>

    <fieldset class="mb-3">
      <legend class="form-label fw-medium fs-6" aria-describedby="ingredientHelp">
        Ингредиенты
      </legend>
      <div v-for="(item, index) in INGREDIENTS" :key="item" class="form-check">
        <input
          :id="`ingredient${index}`"
          v-model="filters.ingredients"
          class="form-check-input"
          type="checkbox"
          :value="item"
        />
        <label class="form-check-label" :for="`ingredient${index}`">{{ item }}</label>
      </div>
      <div id="ingredientHelp" class="form-text">
        Показываются рецепты, где есть все отмеченные продукты.
      </div>
    </fieldset>

    <div class="mb-3">
      <label for="maxTime" class="form-label fw-medium">Время приготовления</label>
      <select id="maxTime" v-model="filters.time" class="form-select">
        <option value="">Не важно</option>
        <option value="30">До 30 минут</option>
        <option value="60">До часа</option>
        <option value="120">До двух часов</option>
      </select>
    </div>

    <button
      type="button"
      class="btn btn-outline-secondary w-100"
      @click="$emit('reset')"
    >
      Сбросить фильтры
    </button>
  </form>
</template>

<script setup>
import { DIFFICULTIES, DISH_TYPES, INGREDIENTS } from '@/utils/recipes'

const filters = defineModel('filters', { type: Object, required: true })

defineEmits(['reset'])
</script>
