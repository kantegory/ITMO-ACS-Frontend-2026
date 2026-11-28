<script>
export default {
  props: { saving: Boolean },
  emits: ['save'],
  data: () => ({ name: '', text: '', validation: '' }),
  methods: {
    submit() {
      if (!this.name.trim() || !this.text.trim()) {
        this.validation = 'Введите название и текст заметки.'
        return
      }
      this.validation = ''
      this.$emit('save', { name: this.name.trim(), text: this.text.trim() })
    },
    reset() {
      this.name = ''
      this.text = ''
      this.$refs.name.focus()
    },
  },
}
</script>

<template>
  <form class="note-form" @submit.prevent="submit">
    <h2>Новая заметка</h2>
    <p v-if="validation" role="alert" class="text-danger">{{ validation }}</p>
    <label class="form-label" for="note-name">Название</label>
    <input id="note-name" ref="name" v-model="name" class="form-control mb-2" maxlength="100" required>
    <label class="form-label" for="note-text">Текст заметки</label>
    <textarea id="note-text" v-model="text" class="form-control mb-2" rows="3" maxlength="2000" required></textarea>
    <button class="btn btn-secondary btn-sm" type="submit" :disabled="saving">{{ saving ? 'Сохранение...' : 'Сохранить заметку' }}</button>
  </form>
</template>
