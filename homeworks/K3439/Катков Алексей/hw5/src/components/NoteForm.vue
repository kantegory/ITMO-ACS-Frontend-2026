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
  <form class="form-panel" @submit.prevent="submit">
    <h2 class="h4 mb-4">Новая заметка</h2>
    <p v-if="validation" role="alert" class="text-danger">{{ validation }}</p>
    <label class="form-label" for="note-name">Название</label>
    <input id="note-name" ref="name" v-model="name" class="form-control mb-4" maxlength="100" required placeholder="Например, секрет хорошего теста">
    <label class="form-label" for="note-text">Текст заметки</label>
    <textarea id="note-text" v-model="text" class="form-control mb-4" rows="6" maxlength="2000" required placeholder="Идеи, пропорции и маленькие открытия…"></textarea>
    <button class="btn btn-primary w-100" type="submit" :disabled="saving">{{ saving ? 'Сохраняем…' : 'Сохранить заметку' }}</button>
  </form>
</template>
