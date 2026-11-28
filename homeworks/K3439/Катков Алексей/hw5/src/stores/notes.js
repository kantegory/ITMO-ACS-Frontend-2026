import { defineStore } from 'pinia'
import { notesApi } from '../api'

export const useNotesStore = defineStore('notes', {
  state: () => ({ notes: [], loading: false, saving: false, error: '' }),
  actions: {
    async loadNotes() {
      this.loading = true
      this.error = ''
      try {
        this.notes = await notesApi.getAll()
      } catch {
        this.error = 'Не удалось загрузить заметки. Проверьте, что JSON Server запущен, и повторите попытку.'
      } finally {
        this.loading = false
      }
    },
    async createNote(note) {
      this.saving = true
      this.error = ''
      try {
        const saved = await notesApi.createNote(note)
        this.notes.unshift(saved)
      } catch {
        this.error = 'Не удалось сохранить заметку. Текст остался в форме - попробуйте ещё раз.'
        throw new Error(this.error)
      } finally {
        this.saving = false
      }
    },
    async removeNote(id) {
      this.error = ''
      try {
        await notesApi.removeNote(id)
        this.notes = this.notes.filter((note) => note.id !== id)
      } catch {
        this.error = 'Не удалось удалить заметку. Повторите попытку.'
      }
    },
  },
})
