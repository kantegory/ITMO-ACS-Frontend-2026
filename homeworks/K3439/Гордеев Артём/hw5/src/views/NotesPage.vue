<template>
  <base-layout>
    <h1 class="mb-4">Notes app</h1>

    <form
      ref="noteForm"
      @submit.prevent="createCard"
      class="d-flex flex-column my-4"
    >
      <input
        type="text"
        v-model="form.name"
        class="form-control my-1"
        placeholder="Название заметки"
        required
      />

      <textarea
        cols="30"
        rows="4"
        v-model="form.text"
        class="form-control my-1"
        placeholder="Текст заметки"
      ></textarea>

      <button type="submit" class="btn btn-primary mt-2">
        Отправить
      </button>
    </form>

    <div v-if="notes.length" class="row row-cols-1 row-cols-md-2 g-4 mt-4" id="notes">
      <div class="col" v-for="note in notes" :key="note.id">
        <note-card :name="note.name" :text="note.text" />
      </div>
    </div>
    <p v-else class="text-muted mt-4">Заметок пока нет.</p>
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

  methods: {
    ...mapActions(useNotesStore, ['loadNotes', 'createNote']),

    async createCard() {
      await this.createNote({ ...this.form })
      await this.loadNotes()
      this.form.name = ''
      this.form.text = ''
      this.$refs.noteForm.reset()
    }
  },

  mounted() {
    this.loadNotes()
  }
}
</script>
