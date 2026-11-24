<script setup>
import { initials, salary } from '../domain.js';
import JobTags from './JobTags.vue';

defineProps({ job: { type: Object, required: true } });
</script>

<template>
  <article class="panel job-card">
    <div class="d-flex align-items-start gap-3 flex-wrap">
      <span class="company-mark" aria-hidden="true">{{ initials(job.company) }}</span>
      <div class="flex-grow-1">
        <h3 class="h5 mb-1"><RouterLink :to="{ name: 'job', params: { id: job.id } }">{{ job.title }}</RouterLink></h3>
        <p class="muted mb-2">{{ job.company }} · {{ job.city }}</p>
        <p class="salary mb-2">{{ salary(job) }} <span class="muted fw-normal">в месяц</span></p>
        <JobTags :job="job" />
      </div>
    </div>
  </article>
</template>
