<script>
export default {
  props: {
    name: { type: String, required: true },
    text: { type: String, default: '' },
  },
}
</script>

<template>
  <article class="note-card">
    <h3>{{ name }}</h3>
    <p v-if="text">{{ text }}</p>
  </article>
</template>
