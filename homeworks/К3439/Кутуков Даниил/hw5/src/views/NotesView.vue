<script setup>
import { onMounted } from 'vue';
import NoteCard from '../components/NoteCard.vue';
import NoteForm from '../components/NoteForm.vue';
import { useNotes } from '../stores/notes.js';

const notes = useNotes();
onMounted(() => notes.load());
</script>

<template>
  <div class="notebook-intro">
    <h1>Мои заметки</h1>
    <p>Сохраните идеи для следующего похода в ресторан.</p>
  </div>
  <div class="row g-4 align-items-start">
    <section class="col-lg-5"><NoteForm :busy="notes.busy" :create="values => notes.create(values)" /></section>
    <section class="col-lg-7" aria-labelledby="saved-title">
      <h2 id="saved-title" class="h4 mb-3">Сохранённые заметки</h2>
      <p v-if="notes.error" role="alert" class="alert alert-danger">{{ notes.error }}</p>
      <p v-else-if="!notes.items.length" role="status">{{ notes.busy ? 'Загружаем заметки…' : 'Добавьте первую заметку.' }}</p>
      <div class="row row-cols-1 row-cols-sm-2 g-3">
        <div v-for="note in notes.items" :key="note.id" class="col"><NoteCard :note="note" /></div>
      </div>
    </section>
  </div>
</template>
