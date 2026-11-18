import { defineStore } from 'pinia'
import { notesApi } from '@/api'

export const useNotesStore = defineStore('notes', {
  state: () => ({ notes: [] }),
  actions: {
    async loadNotes() {
      const { data } = await notesApi.getAll()
      this.notes = data
    },
    async createNote(note) {
      const { data } = await notesApi.createNote(note)
      this.notes.push(data)
    },
  },
})
