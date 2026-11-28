<template>
  <base-layout>
    <h1 class="mb-2">Notes app</h1>
    <p class="text-muted mb-4">ДЗ5 · Vue + npm · axios · pinia · bootstrap</p>

    <form
      ref="noteForm"
      class="d-flex flex-column my-4 gap-2"
      @submit.prevent="createCard"
    >
      <input
        v-model="form.name"
        type="text"
        class="form-control"
        placeholder="Заголовок"
        required
      >
      <textarea
        v-model="form.text"
        class="form-control"
        cols="30"
        rows="6"
        placeholder="Текст заметки"
        required
      />
      <button type="submit" class="btn btn-primary align-self-start">
        Отправить
      </button>
    </form>

    <p v-if="error" class="alert alert-danger">{{ error }}</p>

    <div id="notes" class="row row-cols-1 row-cols-md-2 g-4 mt-2">
      <div v-for="note in notes" :key="note.id" class="col">
        <note-card :name="note.name" :text="note.text" />
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

  components: { BaseLayout, NoteCard },

  data() {
    return {
      error: '',
      form: {
        name: '',
        text: '',
        userId: 1,
      },
    }
  },

  computed: {
    ...mapState(useNotesStore, ['notes']),
  },

  mounted() {
    this.loadNotes().catch((e) => {
      this.error =
        e.message ||
        'Не удалось загрузить заметки. Запусти API: npm run api'
    })
  },

  methods: {
    ...mapActions(useNotesStore, ['loadNotes', 'createNote']),

    async createCard() {
      this.error = ''
      try {
        await this.createNote(this.form)
        await this.loadNotes()
        this.form.name = ''
        this.form.text = ''
        this.$refs.noteForm.reset()
      } catch (e) {
        this.error = e.message || 'Не удалось создать заметку'
      }
    },
  },
}
</script>
