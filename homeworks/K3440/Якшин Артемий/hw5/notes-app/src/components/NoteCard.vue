<template>
  <article class="card note-card h-100">
    <div class="card-body">
      <!-- свойства компонента выводим в шаблоне через {{ }} -->
      <h2 class="card-title h5">{{ name }}</h2>
      <p v-if="text" class="card-text">{{ text }}</p>
      <p v-else class="card-text text-body-secondary">Без текста</p>
    </div>
    <div class="card-footer bg-transparent border-0 pt-0">
      <!-- компонент не удаляет заметку сам, а сообщает родителю событием -->
      <button
        class="btn btn-sm btn-outline-danger"
        type="button"
        :aria-label="`Удалить заметку «${name}»`"
        @click="$emit('delete')"
      >
        Удалить
      </button>
    </div>
  </article>
</template>

<script>
export default {
  name: 'NoteCard',

  // свойства, которые принимает компонент
  props: {
    name: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: false
    }
  },

  // события, которые компонент отправляет родителю
  emits: ['delete']
}
</script>

<style scoped>
.note-card {
  border: 0;
  border-left: 4px solid var(--note-accent);
  border-radius: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.card-text {
  white-space: pre-line;
}
</style>
