<script>
import { mapActions } from 'pinia'
import { useNotesStore } from '@/stores/notes'

export default {
  props: {
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      form: { name: '', text: '' },
      saving: false,
      error: '',
      status: '',
    }
  },
  methods: {
    ...mapActions(useNotesStore, ['createNote']),
    async submitNote() {
      if (this.saving || this.loading) return
      this.status = ''
      this.error = ''
      if (!this.form.name) {
        this.error = 'Введите заголовок заметки.'
        this.$refs.name.focus()
        return
      }
      this.saving = true
      try {
        await this.createNote({ ...this.form, userId: 1 })
        this.form = { name: '', text: '' }
        this.status = 'Заметка сохранена.'
      } catch {
        this.error = 'Не удалось сохранить заметку. Проверьте подключение к API и попробуйте ещё раз.'
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<template>
  <section aria-labelledby="new-note">
    <h2 id="new-note" class="h4">Новая заметка</h2>
    <form @submit.prevent="submitNote" @input="status = ''; error = ''">
      <fieldset :disabled="saving">
        <div>
          <label class="form-label" for="name">Заголовок</label>
          <input id="name" ref="name" v-model.trim="form.name" required
                 class="form-control">
        </div>
        <div class="my-2">
          <label class="form-label" for="text">Текст</label>
          <textarea id="text" v-model.trim="form.text" rows="3" class="form-control"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading || saving">
          {{ saving ? 'Сохранение…' : 'Сохранить заметку' }}
        </button>
      </fieldset>
      <p role="status" class="mb-0 text-success">{{ status }}</p>
      <p v-if="error" role="alert" class="text-danger mt-3 mb-0">{{ error }}</p>
    </form>
  </section>
</template>
