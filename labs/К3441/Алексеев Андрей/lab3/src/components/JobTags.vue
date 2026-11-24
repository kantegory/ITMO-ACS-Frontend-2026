<script setup>
defineProps({ job: { type: Object, required: true } });
</script>

<template>
  <ul class="list-unstyled d-flex flex-wrap gap-2 mb-0">
    <li v-for="tag in [job.industry, job.experience, job.format]" :key="tag" class="status-chip">{{ tag }}</li>
  </ul>
</template>
