<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { getResume, listApplications, saveResume } from '../api.js';
import { useRequest } from '../composables/useRequest.js';
import { useSession } from '../composables/useSession.js';

const { user } = useSession();
const form = reactive({ title: '', city: '', skills: '', about: '' });
const saved = ref(false);
const applications = ref([]);
const ordered = computed(() => [...applications.value].reverse());
const { busy: loading, error: loadError, run: load } = useRequest();
const { busy: saving, error: saveError, run: save } = useRequest();
let resumeId;

onMounted(() => load(async () => {
  const [resume, history] = await Promise.all([getResume(), listApplications()]);
  if (resume) {
    resumeId = resume.id;
    for (const key of Object.keys(form)) form[key] = resume[key];
  }
  applications.value = history;
}));

function submit() {
  saved.value = false;
  return save(async () => {
    const data = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
    if (Object.values(data).some(value => !value)) throw new Error('Заполните все поля резюме.');
    resumeId = (await saveResume(data, resumeId)).id;
    saved.value = true;
  });
}
</script>

<template>
  <div class="page-detail mx-auto">
    <h1 class="h2 mb-2">Кабинет соискателя</h1>
    <p v-if="user" class="muted">{{ user.name }} · {{ user.email }}</p>
    <p v-if="loadError" class="text-danger" role="alert">{{ loadError }}</p>
    <p v-if="loading" role="status">Загружаем кабинет…</p>
    <template v-if="!loading && !loadError">
      <section class="panel p-4 mb-4" aria-labelledby="resume-heading">
        <h2 class="h4 mb-3" id="resume-heading">Моё резюме</h2>
        <form aria-describedby="resume-error" @submit.prevent="submit">
          <label class="form-label" for="resume-title">Желаемая должность</label>
          <input v-model="form.title" class="form-control mb-3" id="resume-title" maxlength="100" required>
          <label class="form-label" for="resume-city">Город</label>
          <input v-model="form.city" class="form-control mb-3" id="resume-city" autocomplete="address-level2" maxlength="80" required>
          <label class="form-label" for="resume-skills">Навыки</label>
          <input v-model="form.skills" class="form-control mb-3" id="resume-skills" maxlength="250" required>
          <label class="form-label" for="resume-about">Опыт работы и о себе</label>
          <textarea v-model="form.about" class="form-control mb-3" id="resume-about" rows="4" maxlength="2500" required></textarea>
          <p class="text-danger" id="resume-error" role="alert">{{ saveError }}</p>
          <button class="btn btn-primary" type="submit" :disabled="saving">Сохранить резюме</button>
          <p class="text-success mt-3 mb-0" role="status" aria-atomic="true">{{ saved ? 'Резюме сохранено.' : '' }}</p>
        </form>
      </section>
      <section class="panel p-4" aria-labelledby="applications-heading">
        <h2 class="h4 mb-3" id="applications-heading">Мои отклики</h2>
        <ul v-if="ordered.length" class="list-group list-group-flush">
          <li v-for="item in ordered" :key="item.id" class="list-group-item px-0">
            <strong>{{ item.title }}</strong><br><span class="muted">{{ item.company }} · {{ new Date(item.createdAt).toLocaleDateString('ru-RU') }}</span>
          </li>
        </ul>
        <p v-else class="muted mb-0">У вас пока нет откликов. <RouterLink :to="{ name: 'catalog' }">Посмотреть вакансии</RouterLink>.</p>
      </section>
    </template>
  </div>
</template>
