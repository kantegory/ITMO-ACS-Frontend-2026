<script setup>
import { computed, ref } from 'vue'
import { formatPrice } from '@/utils/formatters'
const props = defineProps({ price: { type: Number, required: true }, pending: Boolean })
const emit = defineEmits(['confirm'])
const today = new Date().toISOString().slice(0, 10)
const startDate = ref(today)
const endDate = ref(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10))
const nights = computed(() =>
  Math.round((new Date(endDate.value) - new Date(startDate.value)) / 86400000),
)
const valid = computed(() => nights.value > 0)
const total = computed(() => (valid.value ? nights.value * props.price : 0))
function submit() {
  if (valid.value)
    emit('confirm', { startDate: startDate.value, endDate: endDate.value, total: total.value })
}
</script>

<template>
  <aside class="rs-card booking-card">
    <div class="booking-price">{{ formatPrice(price) }} / ночь</div>
    <label class="form-label" for="start-date">Дата заезда</label
    ><input
      id="start-date"
      v-model="startDate"
      class="form-control mb-3"
      type="date"
      :min="today"
    />
    <label class="form-label" for="end-date">Дата выезда</label
    ><input
      id="end-date"
      v-model="endDate"
      class="form-control"
      type="date"
      :min="startDate"
      :aria-invalid="!valid"
    />
    <p v-if="!valid" class="field-error">Дата выезда должна быть позже даты заезда.</p>
    <div class="booking-summary">
      <span>{{ valid ? nights : 0 }} ночей</span><strong>{{ formatPrice(total) }}</strong>
    </div>
    <button class="btn btn-primary w-100" :disabled="!valid || pending" @click="submit">
      {{ pending ? 'Отправляем…' : 'Забронировать' }}
    </button>
  </aside>
</template>

<style scoped>
.booking-card {
  position: sticky;
  top: 24px;
  padding: 24px;
}
.booking-price {
  margin-bottom: 20px;
  font-size: 25px;
  font-weight: 700;
}
.booking-summary {
  display: flex;
  justify-content: space-between;
  padding: 18px 0;
  margin-top: 10px;
  border-top: 1px solid var(--rs-border);
}
</style>
