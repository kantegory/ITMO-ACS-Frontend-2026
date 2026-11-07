<script setup>
defineProps({
  name: { type: String, required: true },
  text: { type: String, default: "" },
});
</script>

<template>
  <article class="card h-100">
    <div class="card-body">
      <h2 class="card-title h5">{{ name }}</h2>
      <p v-if="text" class="card-text">{{ text }}</p>
      <p v-else class="card-text text-secondary">Без описания</p>
    </div>
  </article>
</template>
