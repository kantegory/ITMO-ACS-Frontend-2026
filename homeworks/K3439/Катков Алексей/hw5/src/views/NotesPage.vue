<script>
import { mapActions, mapState } from 'pinia'
import { useNotesStore } from '../stores/notes'
import BaseLayout from '../layouts/BaseLayout.vue'
import NoteCard from '../components/NoteCard.vue'
import NoteForm from '../components/NoteForm.vue'

export default {
  components: { BaseLayout, NoteCard, NoteForm },
  data: () => ({ notice: '' }),
  computed: { ...mapState(useNotesStore, ['notes', 'loading', 'saving', 'error']) },
  mounted() { this.loadNotes() },
  methods: {
    ...mapActions(useNotesStore, ['loadNotes', 'createNote', 'removeNote']),
    async save(note) {
      this.notice = ''
      try {
        await this.createNote(note)
        this.$refs.form.reset()
        this.notice = 'Заметка сохранена.'
      } catch {
        this.notice = ''
      }
    },
  },
}
</script>

<template>
  <BaseLayout>
    <h1>Кулинарные заметки</h1>
    <div v-if="error" class="alert alert-danger" role="alert">
      <p class="mb-2">{{ error }}</p>
      <button class="btn btn-sm btn-outline-secondary" @click="loadNotes">Повторить загрузку</button>
    </div>
    <p class="visually-hidden" role="status">{{ notice }}</p>
    <NoteForm ref="form" :saving="saving" @save="save" />
    <section class="mt-4" aria-labelledby="notes-title" :aria-busy="loading">
      <h2 id="notes-title">Мои заметки ({{ notes.length }})</h2>
      <p v-if="loading" role="status">Загрузка...</p>
      <p v-else-if="!notes.length && !error">Заметок нет.</p>
      <ul v-else-if="notes.length" class="notes-list">
        <li v-for="note in notes" :key="note.id">
          <NoteCard :name="note.name" :text="note.text" @remove="removeNote(note.id)" />
        </li>
      </ul>
    </section>
  </BaseLayout>
</template>
