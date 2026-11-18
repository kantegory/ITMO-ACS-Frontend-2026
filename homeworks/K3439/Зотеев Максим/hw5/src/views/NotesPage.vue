<script>
import { mapActions, mapState } from 'pinia'
import { useNotesStore } from '@/stores/notes'
import BaseLayout from '@/layouts/BaseLayout.vue'
import NoteForm from '@/components/NoteForm.vue'
import NoteCard from '@/components/NoteCard.vue'

export default {
  components: { BaseLayout, NoteForm, NoteCard },
  data() {
    return { loading: true, loadError: false }
  },
  computed: {
    ...mapState(useNotesStore, ['notes']),
  },
  mounted() {
    this.refreshNotes()
  },
  methods: {
    ...mapActions(useNotesStore, ['loadNotes']),
    async refreshNotes() {
      this.loading = true
      this.loadError = false
      try {
        await this.loadNotes()
      } catch {
        this.loadError = true
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <BaseLayout>
    <NoteForm :loading="loading || loadError" @saved="refreshNotes" />
    <section class="mt-4" aria-labelledby="my-notes" :aria-busy="loading">
      <h2 id="my-notes" class="h4">Мои заметки ({{ notes.length }})</h2>
      <p v-if="loadError" role="alert">
        Не удалось загрузить список заметок.
        <button class="btn btn-link p-0" type="button" @click="refreshNotes">Повторить</button>
      </p>
      <p v-else-if="loading" role="status">Загрузка…</p>
      <p v-else-if="!notes.length">Здесь появится ваша первая заметка.</p>
      <ul v-if="notes.length" class="row row-cols-1 row-cols-md-2 g-2 list-unstyled">
        <li v-for="note in notes" :key="note.id" class="col">
          <NoteCard :name="note.name" :text="note.text" />
        </li>
      </ul>
    </section>
  </BaseLayout>
</template>
