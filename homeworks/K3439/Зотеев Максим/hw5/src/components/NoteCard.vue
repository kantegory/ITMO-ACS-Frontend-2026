<script>
export default {
  props: {
    name: { type: String, required: true },
    text: { type: String, default: '' },
  },
}
</script>

<template>
  <article class="card h-100 text-break">
    <div class="card-body">
      <h3 class="card-title h5">{{ name }}</h3>
      <p v-if="text" class="card-text">{{ text }}</p>
    </div>
  </article>
</template>

<style scoped>
.card-text {
  white-space: pre-line;
}
</style>
