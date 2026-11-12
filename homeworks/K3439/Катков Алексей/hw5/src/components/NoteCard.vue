<script>
export default {
  props: {
    name: { type: String, required: true },
    text: { type: String, required: true },
  },
  emits: ['remove'],
}
</script>

<template>
  <article class="note-card h-100">
    <h3 class="h5">{{ name }}</h3>
    <p class="note-text">{{ text }}</p>
    <button class="btn btn-link p-0 mt-auto align-self-start" :aria-label="`Удалить заметку «${name}»`" @click="$emit('remove')">Удалить</button>
  </article>
</template>
