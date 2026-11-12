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
    <p class="eyebrow">ИДЕИ ДЛЯ КУХНИ</p>
    <h1>Всё вкусное начинается<br>с маленькой заметки.</h1>
    <p class="intro mb-5">Сохраняйте удачные сочетания, планы на ужин и рецепты, которые хочется повторить.</p>
    <div v-if="error" class="alert alert-danger d-flex flex-wrap align-items-center gap-3" role="alert">
      <span>{{ error }}</span><button class="btn btn-outline-danger btn-sm" @click="loadNotes">Повторить загрузку</button>
    </div>
    <p class="visually-hidden" role="status" aria-live="polite">{{ notice }}</p>
    <div class="row g-5 align-items-start">
      <aside class="col-lg-4"><NoteForm ref="form" :saving="saving" @save="save" /></aside>
      <section class="col-lg-8" aria-labelledby="notes-title" :aria-busy="loading">
        <div class="d-flex justify-content-between align-items-center mb-4"><h2 id="notes-title" class="h4 m-0">Мои заметки</h2><span class="badge rounded-pill">{{ notes.length }}</span></div>
        <p v-if="loading" role="status">Загружаем заметки…</p>
        <p v-else-if="!notes.length && !error" class="empty-state">Здесь пока пусто. Добавьте первую идею в форме слева.</p>
        <div v-else class="row g-4">
          <div v-for="note in notes" :key="note.id" class="col-md-6"><NoteCard :name="note.name" :text="note.text" @remove="removeNote(note.id)" /></div>
        </div>
      </section>
    </div>
  </BaseLayout>
</template>
