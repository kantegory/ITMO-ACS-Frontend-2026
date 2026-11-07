<script setup>
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import BaseLayout from "../layouts/BaseLayout.vue";
import NoteCard from "../components/NoteCard.vue";
import { useNotesStore } from "../stores/notes";

const store = useNotesStore();
const { notes, draft: form, loading, saving, error } = storeToRefs(store);
const formError = ref("");

async function createCard() {
  formError.value = "";
  const name = form.value.name.trim();
  if (!name) {
    formError.value = "Введите название заметки.";
    return;
  }

  const created = await store.createNote({
    name,
    text: form.value.text.trim(),
    userId: 1,
  });

  if (created) {
    form.value.name = "";
    form.value.text = "";
  }
}

onMounted(() => store.loadNotes());
</script>

<template>
  <BaseLayout>
    <h1 class="mb-4">Мои заметки</h1>

    <form class="mb-5" @submit.prevent="createCard">
      <div class="mb-3">
        <label class="form-label" for="note-name">Название</label>
        <input
          id="note-name"
          v-model="form.name"
          class="form-control"
          maxlength="120"
          required
        />
      </div>

      <div class="mb-3">
        <label class="form-label" for="note-text">Текст заметки</label>
        <textarea
          id="note-text"
          v-model="form.text"
          class="form-control"
          rows="4"
          maxlength="2000"
        ></textarea>
      </div>

      <p v-if="formError" class="text-danger" role="alert">{{ formError }}</p>
      <button class="btn btn-primary" type="submit" :disabled="saving">
        {{ saving ? "Сохранение..." : "Добавить заметку" }}
      </button>
    </form>

    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
      <button class="btn btn-link" type="button" @click="store.loadNotes()">
        Повторить
      </button>
    </div>

    <p v-if="loading" role="status">Загрузка заметок...</p>
    <p v-else-if="!notes.length">Заметок пока нет.</p>
    <div v-else class="row row-cols-1 row-cols-md-2 g-3">
      <div v-for="note in notes" :key="note.id" class="col">
        <NoteCard :name="note.name" :text="note.text" />
      </div>
    </div>
  </BaseLayout>
</template>
