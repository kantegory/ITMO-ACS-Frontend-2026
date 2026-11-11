<template>
  <base-layout>
    <h1 class="mt-4">Заметки</h1>
    <p class="text-body-secondary">Список покупок, идеи на ужин и всё, что не хочется забыть.</p>

    <form
      ref="noteForm"
      class="note-form d-flex flex-column gap-2 my-4"
      @submit.prevent="createCard"
    >
      <label class="form-label mb-0" for="noteName">Заголовок</label>
      <input
        id="noteName"
        v-model="form.name"
        type="text"
        class="form-control"
        placeholder="Например, купить к блинам"
        required
      >

      <label class="form-label mb-0 mt-2" for="noteText">Текст</label>
      <textarea
        id="noteText"
        v-model="form.text"
        class="form-control"
        rows="4"
        placeholder="Молоко, яйца, мука..."
      />

      <button type="submit" class="btn btn-primary align-self-start mt-2">
        Отправить
      </button>
    </form>

    <!-- v-if / v-else: показываем подсказку, пока заметок нет -->
    <p v-if="!notes.length" class="text-body-secondary">Заметок пока нет — добавьте первую.</p>

    <div v-else id="notes" class="row row-cols-1 row-cols-md-2 g-4 mt-2">
      <!-- v-for: по карточке на каждую заметку, key помогает Vue отличать элементы -->
      <div v-for="note in notes" :key="note.id" class="col">
        <note-card
          :name="note.name"
          :text="note.text"
          @delete="deleteNote(note.id)"
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

  components: { BaseLayout, NoteCard },

  // локальные данные компонента: поля формы
  data() {
    return {
      form: {
        name: '',
        text: '',
        userId: 1
      }
    }
  },

  // notes берём из хранилища: при его изменении компонент перерисуется сам
  computed: {
    ...mapState(useNotesStore, ['notes'])
  },

  methods: {
    ...mapActions(useNotesStore, ['loadNotes', 'createNote', 'deleteNote']),

    async createCard() {
      await this.createNote(this.form)

      // в мануале здесь вызывается this.$refs.noteForm.reset(), но он очищает
      // только поля в DOM, а значения в data остаются — сбрасываем сами данные
      this.form.name = ''
      this.form.text = ''
    }
  },

  // хук mounted срабатывает, когда компонент появился на странице
  mounted() {
    this.loadNotes()
  }
}
</script>
