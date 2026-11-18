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
    <div class="workspace">
      <NoteForm :loading="loading || loadError" />
      <section aria-labelledby="my-notes" :aria-busy="loading">
        <h2 id="my-notes">Мои заметки <span class="count">{{ notes.length }}</span></h2>
        <p v-if="loadError" role="alert">
          Не удалось загрузить заметки.
          <button class="retry" type="button" @click="refreshNotes">Повторить</button>
        </p>
        <p v-else-if="loading" role="status">Загрузка…</p>
        <p v-else-if="!notes.length">Здесь появится ваша первая заметка.</p>
        <ul v-if="notes.length" class="notes-grid list-unstyled">
          <li v-for="note in notes" :key="note.id">
            <NoteCard :name="note.name" :text="note.text" />
          </li>
        </ul>
      </section>
    </div>
  </BaseLayout>
</template>
