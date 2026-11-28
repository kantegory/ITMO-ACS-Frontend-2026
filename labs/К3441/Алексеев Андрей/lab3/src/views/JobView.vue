<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { apply, getJob, listApplications } from '../api.js';
import JobTags from '../components/JobTags.vue';
import SalaryConverter from '../components/SalaryConverter.vue';
import { useRequest } from '../composables/useRequest.js';
import { useSession } from '../composables/useSession.js';
import { salary } from '../domain.js';

const route = useRoute();
const { user } = useSession();
const request = new AbortController();
const job = ref(null);
const applied = ref(false);
const sent = ref(false);
const canApply = computed(() => user.value?.role === 'applicant');
const { busy: loading, error: loadError, run: load } = useRequest();
const { busy: applying, error: applyError, run: send } = useRequest();

onMounted(() => load(async () => {
  const { id } = route.params;
  job.value = await getJob(id, request.signal);
  if (request.signal.aborted) return;
  document.title = `${job.value.title} | Вектор`;
  if (canApply.value) {
    const history = await listApplications(request.signal);
    applied.value = history.some(item => String(item.jobId) === id);
  }
}));
onUnmounted(() => request.abort());

function sendApplication() {
  return send(async () => {
    await apply(job.value.id);
    applied.value = true;
    sent.value = true;
  });
}
</script>

<template>
  <div class="page-detail mx-auto">
    <RouterLink class="d-inline-block mb-3" :to="{ name: 'catalog' }">Все вакансии</RouterLink>
    <h1 v-if="!job" class="h2">Вакансия</h1>
    <p class="text-danger" role="alert">{{ loadError }}</p>
    <p v-if="loading && !job" role="status">Загружаем вакансию…</p>
    <article v-if="job" class="panel p-4 p-md-5" aria-labelledby="job-heading">
      <header class="mb-4">
        <p class="muted mb-2">{{ job.company }} · {{ job.city }}</p>
        <h1 class="h2 mb-3" id="job-heading">{{ job.title }}</h1>
        <p class="salary fs-5 mb-3">{{ salary(job) }} <span class="muted fw-normal">в месяц</span></p>
        <SalaryConverter :job="job" />
        <JobTags :job="job" />
      </header>
      <section aria-labelledby="description-heading">
        <h2 class="h5" id="description-heading">Описание</h2>
        <p class="multiline">{{ job.description }}</p>
      </section>
      <section aria-labelledby="requirements-heading">
        <h2 class="h5" id="requirements-heading">Требования</h2>
        <p class="multiline">{{ job.requirements }}</p>
      </section>
      <RouterLink v-if="!user" class="btn btn-primary" :to="{ name: 'login' }">Войти для отклика</RouterLink>
      <button v-else-if="canApply" class="btn btn-primary" type="button" :disabled="loading || applying || applied || Boolean(loadError)" @click="sendApplication">
        {{ applied ? 'Отклик отправлен' : 'Откликнуться' }}
      </button>
      <p class="text-danger mt-3 mb-0" role="alert">{{ applyError }}</p>
      <p class="text-success mt-3 mb-0" role="status" aria-atomic="true">{{ sent ? 'Отклик сохранён в вашем кабинете.' : '' }}</p>
    </article>
  </div>
</template>
