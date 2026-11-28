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
  <article>
    <h3>{{ name }}</h3>
    <p class="note-text mb-1">{{ text }}</p>
    <button class="btn btn-outline-secondary btn-sm" type="button" :aria-label="`Удалить заметку «${name}»`" @click="$emit('remove')">Удалить</button>
  </article>
</template>
