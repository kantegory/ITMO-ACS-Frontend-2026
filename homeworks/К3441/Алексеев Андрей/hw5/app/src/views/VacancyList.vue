<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import CatalogFilters from '../components/CatalogFilters.vue';
import VacancyCard from '../components/VacancyCard.vue';
import { useVacancies } from '../stores/vacancies.js';

const props = defineProps({ savedOnly: Boolean });
const catalog = useVacancies();
const query = ref('');
const industry = ref('');
const heading = ref(null);
const industries = computed(() => [...new Set(catalog.jobs.map(job => job.industry))].sort((a, b) => a.localeCompare(b, 'ru')));
const jobs = computed(() => {
  if (props.savedOnly) return catalog.savedJobs;
  const search = query.value.toLocaleLowerCase('ru');
  return catalog.jobs.filter(job => (!industry.value || job.industry === industry.value)
    && [job.title, job.company, job.city].join(' ').toLocaleLowerCase('ru').includes(search));
});

watch(() => props.savedOnly, async (saved, previous) => {
  document.title = saved ? 'Вектор · Избранное' : 'Вектор · Вакансии';
  if (previous !== undefined) {
    await nextTick();
    heading.value?.focus();
  }
}, { immediate: true });

function toggle(id) {
  catalog.toggleSaved(id);
  if (props.savedOnly) nextTick(() => heading.value?.focus({ preventScroll: true }));
}
</script>

<template>
  <div class="intro mb-4">
    <h1 ref="heading" tabindex="-1" class="mb-2">{{ savedOnly ? 'Избранное' : 'Вакансии' }}</h1>
    <p class="muted mb-0">{{ savedOnly ? 'Вакансии, которые вы сохранили.' : 'Найдите вакансию и добавьте её в избранное.' }}</p>
  </div>
  <CatalogFilters v-if="!savedOnly" v-model:search="query" v-model:industry="industry" :industries="industries" />
  <p v-if="catalog.loading" class="muted mt-4" role="status">Загружаем вакансии…</p>
  <div v-else-if="catalog.error" class="mt-4">
    <p role="alert">{{ catalog.error }}</p>
    <button class="btn btn-outline-success" type="button" @click="catalog.load()">Повторить</button>
  </div>
  <template v-else>
    <p class="muted mt-4" role="status">Вакансий: {{ jobs.length }}</p>
    <div v-if="jobs.length" class="vstack gap-3">
      <VacancyCard v-for="job in jobs" :key="job.id" :job="job"
        :saved="catalog.savedIds.includes(job.id)" @toggle="toggle" />
    </div>
    <p v-else class="panel p-4">
      {{ savedOnly ? 'Список избранного пока пуст.' : 'Подходящих вакансий нет.' }}
      <RouterLink v-if="savedOnly" to="/">Открыть каталог</RouterLink>
    </p>
  </template>
</template>
