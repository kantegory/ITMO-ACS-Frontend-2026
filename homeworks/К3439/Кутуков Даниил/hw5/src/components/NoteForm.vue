<script setup>
import { reactive } from 'vue';

const props = defineProps({ create: { type: Function, required: true }, busy: Boolean });
const form = reactive({ name: '', text: '' });

async function submit() {
  const name = form.name.trim();
  const text = form.text.trim();
  if (!name || !text || props.busy) return;
  if (await props.create({ name, text })) Object.assign(form, { name: '', text: '' });
}
</script>

<template>
  <form class="note-editor card p-4" @submit.prevent="submit">
    <h2 class="h4 mb-3">Новая заметка</h2>
    <label for="note-name" class="form-label">Название</label>
    <input id="note-name" v-model="form.name" class="form-control mb-3" placeholder="Например, ужин на выходных" maxlength="80" required>
    <label for="note-text" class="form-label">Заметка</label>
    <textarea id="note-text" v-model="form.text" class="form-control mb-3" placeholder="Адрес, время или повод для встречи" rows="3" maxlength="350" required></textarea>
    <button class="btn btn-success align-self-start" :disabled="busy || !form.name.trim() || !form.text.trim()">Добавить заметку</button>
  </form>
</template>
