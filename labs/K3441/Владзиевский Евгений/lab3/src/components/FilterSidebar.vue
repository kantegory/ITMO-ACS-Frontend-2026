<script setup>
import { computed } from 'vue';

// Фильтры поиска. Значения приходят объектом и меняются прямо в нём:
// объект реактивный (reactive), поэтому родитель видит изменения.
const props = defineProps({
  filters: { type: Object, required: true }
});

const PRICE_CEILING = 350000;

// Пустая цена «до» значит «без ограничения», но ползунок в таком случае
// уезжал бы в минимум. Поэтому у него своя обёртка: пусто — это максимум.
const priceMax = computed({
  get: () => props.filters.max || PRICE_CEILING,
  set: (value) => {
    props.filters.max = Number(value) >= PRICE_CEILING ? '' : Number(value);
  }
});

const emit = defineEmits(['reset']);

const TYPES = [
  { value: 'flat', label: 'Квартира' },
  { value: 'studio', label: 'Студия' },
  { value: 'room', label: 'Комната' },
  { value: 'house', label: 'Дом или таунхаус' }
];

const CONDITIONS = [
  { key: 'nocommission', label: 'Без комиссии' },
  { key: 'pets', label: 'Можно с животными' },
  { key: 'kids', label: 'Можно с детьми' },
  { key: 'furniture', label: 'С мебелью' },
  { key: 'balcony', label: 'Балкон или терраса' }
];
</script>

<template>
  <div id="filters" class="offcanvas-lg offcanvas-start filters" tabindex="-1" aria-labelledby="filters-title">
    <div class="offcanvas-header border-bottom">
      <h2 id="filters-title" class="offcanvas-title fs-5">Фильтры</h2>
      <button
        type="button"
        class="btn-close d-lg-none"
        data-bs-dismiss="offcanvas"
        data-bs-target="#filters"
        aria-label="Закрыть фильтры"
      ></button>
    </div>

    <div class="offcanvas-body px-3 pt-0">
      <form class="w-100" @submit.prevent>
        <fieldset class="filter-group">
          <legend>Тип жилья</legend>
          <div v-for="type in TYPES" :key="type.value" class="form-check">
            <input
              :id="`t-${type.value}`"
              v-model="filters.types"
              class="form-check-input"
              type="checkbox"
              :value="type.value"
            >
            <label class="form-check-label" :for="`t-${type.value}`">{{ type.label }}</label>
          </div>
        </fieldset>

        <fieldset class="filter-group">
          <legend>Комнат</legend>
          <div class="rooms-group" role="group" aria-label="Количество комнат">
            <template v-for="n in 4" :key="n">
              <input :id="`r${n}`" v-model="filters.rooms" class="btn-check" type="checkbox" :value="n">
              <label class="btn btn-sm" :for="`r${n}`">{{ n === 4 ? '4+' : n }}</label>
            </template>
          </div>
        </fieldset>

        <fieldset class="filter-group">
          <legend>Цена в месяц, ₽</legend>
          <div class="d-flex gap-2">
            <div>
              <label class="visually-hidden" for="price-min">от</label>
              <input id="price-min" v-model.number="filters.min" class="form-control" type="number" placeholder="от" min="0" step="1000" inputmode="numeric">
            </div>
            <div>
              <label class="visually-hidden" for="price-max">до</label>
              <input id="price-max" v-model.number="filters.max" class="form-control" type="number" placeholder="до" min="0" step="1000" inputmode="numeric">
            </div>
          </div>
          <label class="form-label small text-muted-2 mt-2 mb-0" for="price-range">Быстро выбрать максимум</label>
          <input id="price-range" v-model.number="priceMax" class="form-range" type="range" min="20000" :max="PRICE_CEILING" step="5000">
        </fieldset>

        <fieldset class="filter-group">
          <legend>Площадь, м²</legend>
          <label class="visually-hidden" for="area-min">Площадь от</label>
          <input id="area-min" v-model.number="filters.area" class="form-control" type="number" placeholder="не меньше" min="0" inputmode="numeric">
        </fieldset>

        <fieldset class="filter-group">
          <legend>Условия</legend>
          <div v-for="condition in CONDITIONS" :key="condition.key" class="form-check form-switch">
            <input :id="`f-${condition.key}`" v-model="filters[condition.key]" class="form-check-input" type="checkbox" role="switch">
            <label class="form-check-label" :for="`f-${condition.key}`">{{ condition.label }}</label>
          </div>
        </fieldset>

        <div class="d-grid gap-2 py-3">
          <button class="btn btn-primary d-lg-none" type="button" data-bs-dismiss="offcanvas" data-bs-target="#filters">
            Показать
          </button>
          <button class="btn btn-outline-secondary" type="button" @click="emit('reset')">Сбросить фильтры</button>
        </div>
      </form>
    </div>
  </div>
</template>
