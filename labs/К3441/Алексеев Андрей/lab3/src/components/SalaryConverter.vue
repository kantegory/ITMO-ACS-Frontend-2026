<script setup>
import { ref } from 'vue';
import { exchangeRates } from '../api.js';
import { salary } from '../domain.js';

const props = defineProps({ job: { type: Object, required: true } });
const currency = ref('RUB');
const status = ref('');
let revision = 0;

async function convert() {
  const latest = ++revision;
  const target = currency.value;
  if (target === 'RUB') {
    status.value = '';
    return;
  }
  status.value = 'Загружаем курс…';
  try {
    const rates = await exchangeRates();
    if (latest === revision) status.value = `Примерно ${salary(props.job, target, rates[target])} в месяц`;
  } catch {
    if (latest !== revision) return;
    status.value = 'Курс недоступен. Попробуйте выбрать валюту ещё раз.';
    currency.value = 'RUB';
  }
}
</script>

<template>
  <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
    <label for="currency">Пересчитать в валюту</label>
    <select class="form-select w-auto" id="currency" v-model="currency" @change="convert">
      <option value="RUB">RUB</option>
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
    </select>
  </div>
  <p class="muted mb-3" role="status" aria-atomic="true">{{ status }}</p>
  <p class="small muted mb-3">Источник курсов: <a href="https://www.exchangerate-api.com/">ExchangeRate-API</a></p>
</template>
