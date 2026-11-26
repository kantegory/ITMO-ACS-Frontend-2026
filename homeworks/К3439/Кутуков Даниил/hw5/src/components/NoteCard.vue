<script setup>
defineProps({ note: { type: Object, required: true } });
</script>

<template>
  <article class="card note-card h-100">
    <div class="card-body p-4">
      <h3>{{ note.name }}</h3>
      <p class="mb-0 text-secondary">{{ note.text }}</p>
    </div>
  </article>
</template>
