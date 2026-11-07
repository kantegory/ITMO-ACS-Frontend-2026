<script setup>
import { ref } from 'vue'
const props = defineProps({ modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue', 'search', 'reset'])
const expanded = ref(false)
function patch(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function selectMode(mode) {
  patch('mode', mode)
  emit('search')
}
</script>

<template>
  <form class="rs-card search-filters" @submit.prevent="$emit('search')">
    <div class="filter-grid">
      <fieldset class="mode-field">
        <legend class="form-label">Способ аренды</legend>
        <div class="rent-mode">
          <button
            v-for="mode in [
              { id: 'DAILY', label: 'Посуточно' },
              { id: 'MONTHLY', label: 'Помесячно' },
            ]"
            :key="mode.id"
            type="button"
            :class="{ active: modelValue.mode === mode.id }"
            :aria-pressed="modelValue.mode === mode.id"
            @click="selectMode(mode.id)"
          >
            {{ mode.label }}
          </button>
        </div>
      </fieldset>
      <div>
        <label class="form-label" for="location">Расположение</label
        ><input
          id="location"
          class="form-control"
          :value="modelValue.location"
          @input="patch('location', $event.target.value)"
        />
      </div>
      <div>
        <label class="form-label" for="house-type">Тип недвижимости</label
        ><select
          id="house-type"
          class="form-select"
          :value="modelValue.type"
          @change="patch('type', $event.target.value)"
        >
          <option value="">Любой тип</option>
          <option>Квартира</option>
          <option>Дом</option>
          <option>Комната</option>
          <option>Студия</option>
        </select>
      </div>
      <button class="btn btn-primary" type="submit">Найти</button>
    </div>
    <div class="filter-row">
      <div>
        <label class="form-label" for="price-min">Цена от</label
        ><input
          id="price-min"
          class="form-control"
          type="number"
          min="0"
          :value="modelValue.min"
          @input="patch('min', $event.target.value)"
        />
      </div>
      <div>
        <label class="form-label" for="price-max">Цена до</label
        ><input
          id="price-max"
          class="form-control"
          type="number"
          min="0"
          :value="modelValue.max"
          @input="patch('max', $event.target.value)"
        />
      </div>
      <button
        class="btn btn-primary"
        type="button"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        Дополнительные фильтры
      </button>
      <button class="btn btn-link" type="button" @click="$emit('reset')">Сбросить</button>
    </div>
    <div v-if="expanded" class="extra-filters">Дополнительные фильтры появятся позже</div>
  </form>
</template>

<style scoped>
.search-filters {
  padding: 24px;
}
.filter-grid {
  display: grid;
  grid-template-columns: 1.25fr 2fr 1.5fr auto;
  align-items: end;
  gap: 16px;
}
.filter-row {
  display: flex;
  align-items: end;
  gap: 16px;
  margin-top: 18px;
}
.filter-row > div {
  width: 180px;
}
.filter-row .btn-link:hover,
.filter-row .btn-link:focus-visible {
  color: var(--rs-primary);
  background: var(--rs-primary-soft);
}
:global(:root[data-theme='dark']) .filter-row .btn-link:hover,
:global(:root[data-theme='dark']) .filter-row .btn-link:focus-visible {
  color: #d4e7ff;
  background: rgb(158 197 254 / 22%);
}
:global(:root[data-theme='dark']) .filter-row .btn-link {
  color: #8bb9fe;
}
.mode-field {
  margin: 0;
  padding: 0;
  border: 0;
}
.rent-mode {
  display: flex;
  padding: 3px;
  border: 1px solid var(--rs-border);
  border-radius: 9px;
}
.rent-mode button {
  flex: 1;
  padding: 7px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--rs-muted);
}
.rent-mode button.active {
  background: var(--rs-primary);
  color: #fff;
}
.extra-filters {
  margin-top: 16px;
  padding: 16px;
  border-radius: 10px;
  background: var(--rs-surface-soft);
  color: var(--rs-muted);
}
@media (max-width: 992px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 576px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  .filter-row {
    align-items: stretch;
    flex-direction: column;
  }
  .filter-row > div {
    width: 100%;
  }
}
</style>
