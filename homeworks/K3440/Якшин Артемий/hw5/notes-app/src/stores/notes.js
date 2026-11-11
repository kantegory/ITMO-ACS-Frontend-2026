import { defineStore } from 'pinia'
// импортируем API
import { notesApi } from '@/api'

// создаём хранилище
const useNotesStore = defineStore('notes', {
  // в стейте заводим пустой массив с заметками
  state: () => ({
    notes: []
  }),

  actions: {
    // загрузка всех заметок с сервера
    async loadNotes() {
      const response = await notesApi.getAll()

      this.notes = response.data

      return response
    },

    // создание новой заметки
    async createNote(data) {
      const response = await notesApi.createNote(data)

      // в мануале здесь this.notes = response.data, но сервер возвращает
      // одну созданную заметку, а не весь список — поэтому добавляем её в массив
      this.notes.push(response.data)

      return response
    },

    // удаление заметки
    async deleteNote(id) {
      const response = await notesApi.deleteNote(id)

      this.notes = this.notes.filter((note) => note.id !== id)

      return response
    }
  }
})

export default useNotesStore
