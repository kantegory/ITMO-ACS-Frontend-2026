<script setup>
import { reactive, watch } from 'vue'
import { CITIES, PROPERTY_TYPES } from '@/composables/useFormatters'
import SvgIcon from '@/components/common/SvgIcon.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['apply', 'reset'])

const form = reactive({
  type: props.modelValue.type ?? '',
  city: props.modelValue.city ?? '',
  priceMin: props.modelValue.priceMin ?? '',
  priceMax: props.modelValue.priceMax ?? '',
})

watch(
  () => props.modelValue,
  (next) => {
    form.type = next.type ?? ''
    form.city = next.city ?? ''
    form.priceMin = next.priceMin ?? ''
    form.priceMax = next.priceMax ?? ''
  },
  { deep: true },
)

function handleSubmit() {
  emit('apply', { ...form })
}

function handleReset() {
  form.type = ''
  form.city = ''
  form.priceMin = ''
  form.priceMax = ''
  emit('reset')
}
</script>

<template>
  <form class="card card-body" role="search" aria-labelledby="filtersTitle" @submit.prevent="handleSubmit">
    <h2 id="filtersTitle" class="h5 mb-3">Фильтры</h2>

    <div class="mb-3">
      <label for="filter-type" class="form-label">Тип жилья</label>
      <select id="filter-type" v-model="form.type" class="form-select" :disabled="disabled">
        <option value="">Любой</option>
        <option v-for="type in PROPERTY_TYPES" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
    </div>

    <div class="mb-3">
      <label for="filter-city" class="form-label">Город</label>
      <select id="filter-city" v-model="form.city" class="form-select" :disabled="disabled">
        <option value="">Любой</option>
        <option v-for="city in CITIES" :key="city" :value="city">
          {{ city }}
        </option>
      </select>
    </div>

    <fieldset class="mb-3">
      <legend class="form-label fs-6">Цена, ₽ в месяц</legend>
      <div class="input-group">
        <input
          id="filter-price-min"
          v-model="form.priceMin"
          type="number"
          class="form-control"
          placeholder="от"
          min="0"
          aria-label="Цена от, рублей"
          :disabled="disabled"
        >
        <input
          id="filter-price-max"
          v-model="form.priceMax"
          type="number"
          class="form-control"
          placeholder="до"
          min="0"
          aria-label="Цена до, рублей"
          :disabled="disabled"
        >
      </div>
    </fieldset>

    <button type="submit" class="btn btn-primary mb-2" :disabled="disabled">
      <SvgIcon name="search" /> Показать
    </button>
    <button type="button" class="btn btn-outline-secondary" :disabled="disabled" @click="handleReset">
      Сбросить
    </button>
  </form>
</template>
