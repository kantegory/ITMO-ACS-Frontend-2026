<script setup>
import { computed, onMounted, ref } from 'vue';
import { listJobs } from '../api.js';
import JobCard from '../components/JobCard.vue';
import JobFilters from '../components/JobFilters.vue';
import { useRequest } from '../composables/useRequest.js';
import { filterJobs, orderJobs } from '../domain.js';

const emptyFilters = () => ({ query: '', industry: '', experience: '', minimum: '', format: '' });
const jobs = ref([]);
const filters = ref(emptyFilters());
const search = ref('');
const order = ref('new');
const results = ref(null);
const { busy, error, run } = useRequest();
const matching = computed(() => orderJobs(filterJobs(jobs.value, filters.value), order.value));

function load() {
  return run(async () => { jobs.value = await listJobs(); });
}

function submitSearch() {
  filters.value.query = search.value;
  results.value?.scrollIntoView({ block: 'start' });
}

function reset() {
  search.value = '';
  order.value = 'new';
  filters.value = emptyFilters();
}

onMounted(load);
</script>

<template>
  <section class="hero row g-0 align-items-stretch mb-4 mb-md-5" aria-labelledby="hero-title">
    <div class="col-md-7 hero-copy">
      <h1 id="hero-title" class="fw-bold mb-3">Найди работу по себе</h1>
      <p class="mb-4">Ищите вакансии по сфере, опыту и зарплате. Подходящие позиции можно открыть прямо из каталога.</p>
      <form class="search-box d-flex gap-2" role="search" @submit.prevent="submitSearch">
        <label class="visually-hidden" for="query">Должность, компания или город</label>
        <input v-model="search" class="form-control" type="search" id="query" placeholder="Должность, компания или город" @input="!$event.target.value && (filters.query = '')">
        <button class="btn btn-primary px-md-4" type="submit">Найти</button>
      </form>
    </div>
    <div class="col-md-5">
      <img class="hero-photo" src="/office.jpg" alt="" width="1050" height="701">
    </div>
  </section>
  <div class="row g-4 align-items-start" ref="results">
    <aside class="col-lg-3">
      <JobFilters v-model="filters" @clear="reset" />
    </aside>
    <section class="col-lg-9" aria-labelledby="result-title">
      <div class="d-flex justify-content-between align-items-sm-center flex-column flex-sm-row gap-2 mb-3">
        <div>
          <h2 class="h3 mb-1" id="result-title">Вакансии</h2>
          <p class="muted mb-0" role="status">{{ busy ? 'Загружаем вакансии…' : error ? '' : `Найдено: ${matching.length}` }}</p>
        </div>
        <div>
          <label class="visually-hidden" for="sort">Сортировка вакансий</label>
          <select v-model="order" class="form-select" id="sort">
            <option value="new">Сначала новые</option>
            <option value="salary">Сначала выше зарплата</option>
          </select>
        </div>
      </div>
      <div v-if="error" class="panel p-4">
        <p class="text-danger" role="alert">{{ error }}</p>
        <button class="btn btn-outline-primary" type="button" @click="load">Попробовать ещё раз</button>
      </div>
      <div v-else-if="!busy" class="vstack gap-3">
        <JobCard v-for="job in matching" :key="job.id" :job="job" />
        <p v-if="!matching.length" class="panel p-4 mb-0">Подходящих вакансий нет. Измените запрос или сбросьте фильтры.</p>
      </div>
    </section>
  </div>
</template>
