<template>
  <base-layout>
    <h1>Notes app</h1>

    <form ref="noteForm" class="card card-body my-4" @submit.prevent="createCard">
      <div class="mb-3">
        <label class="form-label" for="noteName">Заголовок</label>
        <input id="noteName" v-model="form.name" type="text" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label" for="noteText">Текст заметки</label>
        <textarea id="noteText" v-model="form.text" class="form-control" rows="4" />
      </div>

      <div>
        <button type="submit" class="btn btn-primary">Отправить</button>
      </div>
    </form>

    <p v-if="!notes.length" class="text-body-secondary">Заметок пока нет.</p>

    <div v-else id="notes" class="row row-cols-1 row-cols-md-2 g-4 mt-2">
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
      form: {
        name: '',
        text: '',
        // пока заметки создаются от пользователя с id 1
        userId: 1,
      },
    }
  },

  computed: {
    ...mapState(useNotesStore, ['notes']),
  },

  mounted() {
    this.loadNotes()
  },

  methods: {
    ...mapActions(useNotesStore, ['loadNotes', 'createNote']),

    async createCard() {
      await this.createNote(this.form)
      await this.loadNotes()

      // reset() очищает поля формы, а v-model — данные компонента
      this.$refs.noteForm.reset()
      this.form.name = ''
      this.form.text = ''
    },
  },
}
</script>
