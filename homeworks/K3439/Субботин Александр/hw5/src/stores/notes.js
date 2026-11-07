import { defineStore } from 'pinia'
import { notesApi } from '@/api'

const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [],
  }),

  actions: {
    async loadNotes() {
      const response = await notesApi.getAll()

      this.notes = response.data

      return response
    },

    async createNote(data) {
      const response = await notesApi.createNote(data)

      // сервер возвращает созданную заметку — добавляем её к списку, а не заменяем им весь список
      this.notes.push(response.data)

      return response
    },
  },
})

export default useNotesStore
