<template>
  <base-layout>
    <h1>Notes app</h1>

    <form
      ref="noteForm"
      @submit.prevent="createCard"
      class="d-flex flex-column my-5"
    >
      <input
        type="text"
        v-model="form.name"
        class="my-1"
        placeholder="Название заметки"
        required
      >

      <textarea
        cols="30" rows="10"
        v-model="form.text"
        class="my-1"
        placeholder="Текст заметки"
      />

      <button
        type="submit"
        class="btn btn-primary"
      >
        Отправить
      </button>
    </form>

    <div class="row row-cols-1 row-cols-md-2 g-4 mt-5" id="notes">
      <div class="col" v-for="note in notes" :key="note.id">
        <note-card
          :name="note.name"
          :text="note.text"
          :created-at="note.createdAt"
          @delete="deleteCard(note.id)"
        />
      </div>
    </div>
  </base-layout>
</template>

<script>
import { mapActions, mapState } from 'pinia'

import useNotesStore from '@/stores/notes'

import BaseLayout from '@/layouts/BaseLayout.vue'
import NoteCard from '@/components/NoteCard.vue'

export default {
  name: 'NotesPage',

  components: { BaseLayout, NoteCard },

  data() {
    return {
      form: {
        name: '',
        text: '',
        userId: 1
      }
    }
  },

  computed: {
    ...mapState(useNotesStore, ['notes'])
  },

  mounted() {
    this.loadNotes().catch((error) => {
      console.error('Не удалось загрузить заметки:', error)
    })
  },

  methods: {
    ...mapActions(useNotesStore, ['loadNotes', 'createNote', 'deleteNote']),

    async createCard() {
      const name = this.form.name.trim()

      if (!name) {
        return
      }

      try {
        await this.createNote({
          name,
          text: this.form.text.trim(),
          userId: this.form.userId,
          createdAt: this.getCurrentDate()
        })
        await this.loadNotes()

        this.resetForm()
      } catch (error) {
        console.error('Не удалось создать заметку:', error)
      }
    },

    async deleteCard(id) {
      try {
        await this.deleteNote(id)
      } catch (error) {
        console.error('Не удалось удалить заметку:', error)
      }
    },

    resetForm() {
      this.form.name = ''
      this.form.text = ''

      this.$refs.noteForm?.reset()
    },

    getCurrentDate() {
      const now = new Date()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')

      return `${now.getFullYear()}-${month}-${day}`
    }
  }
}
</script>
