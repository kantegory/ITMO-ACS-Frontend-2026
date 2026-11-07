<template>
  <article class="card note-card">
    <div class="card-body">
      <h2 class="card-title h5">{{ name }}</h2>
      <p v-if="text" class="card-text">{{ text }}</p>
      <p v-else class="card-text text-body-secondary fst-italic">Без текста</p>
    </div>
  </article>
</template>

<script>
export default {
  name: 'NoteCard',

  // свойства, которые компонент получает от родителя
  props: {
    name: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: false,
      default: '',
    },
  },
}
</script>
