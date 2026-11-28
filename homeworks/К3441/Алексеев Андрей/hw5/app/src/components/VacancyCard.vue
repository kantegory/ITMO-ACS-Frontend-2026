<script setup>
defineProps({
  job: { type: Object, required: true },
  saved: { type: Boolean, required: true }
});
defineEmits(['toggle']);

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency: 'RUB', maximumFractionDigits: 0
});
</script>

<template>
  <article class="panel vacancy-card">
    <div>
      <h2 class="h5 mb-1">{{ job.title }}</h2>
      <p class="muted mb-2">{{ job.company }} · {{ job.city }}</p>
      <p class="fw-semibold mb-2">{{ money.format(job.salaryMin) }} – {{ money.format(job.salaryMax) }}</p>
      <p class="muted mb-0">{{ job.industry }} · {{ job.format }}</p>
    </div>
    <button class="btn btn-outline-success" type="button" :aria-pressed="saved"
      :aria-label="`В избранное: ${job.title}`" @click="$emit('toggle', job.id)">
      {{ saved ? 'В избранном' : 'В избранное' }}
    </button>
  </article>
</template>
