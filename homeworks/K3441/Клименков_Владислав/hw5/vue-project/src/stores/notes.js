import { defineStore } from 'pinia'

import { notesApi } from '@/api'

const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: []
  }),

  actions: {
    async loadNotes() {
      const response = await notesApi.getAll()

      this.notes = Array.isArray(response.data) ? response.data : []

      return response
    },

    async createNote(data) {
      const response = await notesApi.createNote(data)

      if (Array.isArray(this.notes)) {
        this.notes.push(response.data)
      } else {
        this.notes = [response.data]
      }

      return response
    },

    async deleteNote(id) {
      const response = await notesApi.deleteNote(id)

      this.notes = this.notes.filter((note) => note.id !== id)

      return response
    }
  }
})

export default useNotesStore
