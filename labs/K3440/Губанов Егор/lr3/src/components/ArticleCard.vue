<script setup>
import { CATEGORIES } from '../constants.js'
defineProps({ article: { type: Object, required: true } })
const emit = defineEmits(['open'])
</script>

<template>
  <article class="brutal-card h-100 p-4 d-flex flex-column">
    <p class="eyebrow">{{ CATEGORIES[article.category] }}</p>
    <h2 class="h3">{{ article.title }}</h2>
    <p>{{ article.summary }}</p>
    <button class="btn btn-brutal btn-lilac mt-auto" type="button" @click="emit('open', article.id, $event.currentTarget)">Читать статью</button>
  </article>
</template>