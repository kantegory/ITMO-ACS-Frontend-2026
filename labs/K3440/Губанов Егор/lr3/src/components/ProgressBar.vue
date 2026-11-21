<script setup>
defineProps({
  completed: { type: Number, required: true },
  total: { type: Number, required: true },
  percent: { type: Number, required: true }
})
</script>

<template>
  <section class="brutal-card p-4 my-4" aria-labelledby="planTitle">
    <div class="d-flex flex-wrap justify-content-between gap-3 align-items-center">
      <h2 id="planTitle" class="h3 mb-0">План на неделю</h2>
      <p class="eyebrow mb-0" aria-live="polite">Выполнено {{ completed }} из {{ total }}</p>
    </div>
    <div class="progress brutal-progress mt-3" role="progressbar" aria-label="Выполнение плана"
         aria-valuemin="0" aria-valuemax="100" :aria-valuenow="percent">
      <div class="progress-bar" :style="{ width: `${percent}%` }"></div>
    </div>
  </section>
</template>