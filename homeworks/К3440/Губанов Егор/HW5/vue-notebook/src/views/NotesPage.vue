<template>
  <base-layout>
    <h1>Заметочки</h1>

    <form
      ref="noteForm"
      class="d-flex flex-column my-5"
      @submit.prevent="createCard"
    >
      <label for="note-name">Заголовок</label>
      <input
        id="note-name"
        v-model="form.name"
        type="text"
        class="form-control my-1"
        required
      >

      <label for="note-text">Текст</label>
      <textarea
        id="note-text"
        v-model="form.text"
        rows="5"
        class="form-control my-1"
      ></textarea>

      <button type="submit" class="btn btn-primary">
        Отправить
      </button>
    </form>

    <p v-if="notes.length === 0">
      Пока нет заметок. Добавь первую!
    </p>

    <div
      id="notes"
      class="row row-cols-1 row-cols-md-2 g-4 mt-5"
    >
      <div
        v-for="note in notes"
        :key="note.id"
        class="col"
      >
        <note-card
          :name="note.name"
          :text="note.text"
        />
      </div>
    </div>
  </base-layout>
</template>

<script>
import { mapActions, mapState } from 'pinia'

import BaseLayout from '@/layouts/BaseLayout.vue'
import NoteCard from '@/components/NoteCard.vue'
import useNotesStore from '@/stores/notes'

export default {
  name: 'NotesPage',

  components: {
    BaseLayout,
    NoteCard
  },

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

  methods: {
    ...mapActions(useNotesStore, ['loadNotes', 'createNote']),

    async createCard() {
      if (!this.form.name.trim()) return

      await this.createNote({ ...this.form })
      await this.loadNotes()

      this.form.name = ''
      this.form.text = ''
    }
  },

  mounted() {
    this.loadNotes()
  }
}
</script>
