<script setup>
import { computed, onMounted, ref } from 'vue';
import { deleteJob, ownJobs, saveJob } from '../api.js';
import JobEditor from '../components/JobEditor.vue';
import { useRequest } from '../composables/useRequest.js';
import { useSession } from '../composables/useSession.js';
import { orderJobs } from '../domain.js';

const { user } = useSession();
const jobs = ref([]);
const editing = ref(null);
const editor = ref(null);
const message = ref('');
const { busy: loading, error: loadError, run: load } = useRequest();
const { busy: saving, error: saveError, run: save } = useRequest();
const { busy: deleting, error: deleteError, run: remove } = useRequest();
const ordered = computed(() => orderJobs(jobs.value, 'new'));
const busy = computed(() => loading.value || saving.value || deleting.value);

onMounted(() => load(async () => { jobs.value = await ownJobs(); }));

function edit(job) {
  message.value = '';
  saveError.value = '';
  editing.value = job;
}

function closeEditor() {
  editing.value = null;
  saveError.value = '';
  editor.value?.reset();
}

function submit(job) {
  return save(async () => {
    message.value = '';
    if (Object.values(job).some(value => value === '')) throw new Error('Заполните все поля вакансии.');
    if (job.salaryMin > job.salaryMax) throw new Error('Верхняя граница зарплаты должна быть не ниже нижней.');
    const id = editing.value?.id;
    const record = await saveJob(job, id);
    jobs.value = id ? jobs.value.map(item => item.id === id ? record : item) : [...jobs.value, record];
    closeEditor();
    message.value = id ? 'Изменения сохранены.' : 'Вакансия опубликована.';
  });
}

function removeJob(job) {
  if (!window.confirm('Удалить эту вакансию?')) return;
  return remove(async () => {
    message.value = '';
    await deleteJob(job.id);
    jobs.value = jobs.value.filter(item => item.id !== job.id);
    if (editing.value?.id === job.id) closeEditor();
    message.value = 'Вакансия удалена.';
  });
}
</script>

<template>
  <div class="page-detail mx-auto">
    <h1 class="h2 mb-2">Кабинет работодателя</h1>
    <p v-if="user" class="muted">{{ user.name }} · {{ user.email }}</p>
    <p v-if="loading" role="status">Загружаем кабинет…</p>
    <p v-if="loadError" class="text-danger" role="alert">{{ loadError }}</p>
    <template v-if="!loading && !loadError">
      <JobEditor ref="editor" :job="editing" :disabled="busy" :error="saveError" @save="submit" @cancel="closeEditor" />
      <section class="panel p-4" aria-labelledby="my-jobs-heading">
        <h2 class="h4 mb-3" id="my-jobs-heading">Мои вакансии</h2>
        <p v-if="message" class="text-success" role="status">{{ message }}</p>
        <p v-if="deleteError" class="text-danger" role="alert">{{ deleteError }}</p>
        <ul v-if="ordered.length" class="list-group list-group-flush">
          <li v-for="job in ordered" :key="job.id" class="list-group-item px-0 d-flex flex-wrap align-items-center justify-content-between gap-2">
            <RouterLink :to="{ name: 'job', params: { id: job.id } }">{{ job.title }}</RouterLink>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-sm btn-outline-primary" type="button" :disabled="busy" @click="edit(job)">Изменить</button>
              <button class="btn btn-sm btn-outline-danger" type="button" :disabled="busy" @click="removeJob(job)">Удалить</button>
            </div>
          </li>
        </ul>
        <p v-else class="muted mb-0">Вы ещё не опубликовали вакансии.</p>
      </section>
    </template>
  </div>
</template>
