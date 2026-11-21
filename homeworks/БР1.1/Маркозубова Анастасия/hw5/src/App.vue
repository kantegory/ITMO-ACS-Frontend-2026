<script setup>
import { computed, ref } from 'vue';
import SiteHeader from './components/SiteHeader.vue';
import VacancyCard from './components/VacancyCard.vue';

const query = ref('');
const industry = ref('');
const selected = ref(null);
const vacancies = [
  { id: 1, title: 'Frontend-разработчик', company: 'ООО «Айти Технологии»', industry: 'IT', salary: 120000, experience: 'От 1 года', description: 'Разработка адаптивных интерфейсов. Требуются HTML, CSS и JavaScript.' },
  { id: 2, title: 'Project-менеджер', company: 'АО «Инновации»', industry: 'Управление', salary: 80000, experience: 'От 3 лет', description: 'Планирование проектов и координация команды.' },
  { id: 3, title: 'SMM-специалист', company: 'ООО «МедиаГрупп»', industry: 'Маркетинг', salary: 90000, experience: 'Без опыта', description: 'Подготовка публикаций и работа с социальными сетями.' }
];
const filtered = computed(() => vacancies.filter(v =>
  v.title.toLowerCase().includes(query.value.trim().toLowerCase()) &&
  (!industry.value || v.industry === industry.value)
));
</script>

<template>
  <SiteHeader />
  <main id="main" class="container">
    <section class="hero"><h1>Найдите работу с FinderJobs</h1><p>Выберите подходящую вакансию и изучите её описание.</p></section>
    <form class="filters" @submit.prevent>
      <div><label for="query">Название вакансии</label><input id="query" v-model="query" type="search" placeholder="Например, Frontend"></div>
      <div><label for="industry">Отрасль</label><select id="industry" v-model="industry"><option value="">Все отрасли</option><option>IT</option><option>Управление</option><option>Маркетинг</option></select></div>
    </form>
    <p role="status">Найдено вакансий: {{ filtered.length }}</p>
    <div class="grid"><VacancyCard v-for="vacancy in filtered" :key="vacancy.id" :vacancy="vacancy" @select="selected = $event" /></div>
    <section v-if="selected" class="details" aria-labelledby="details-title">
      <h2 id="details-title">{{ selected.title }}</h2><p>{{ selected.description }}</p><button @click="selected = null">Закрыть описание</button>
    </section>
  </main>
  <footer>© 2026 ООО «ФиндерДжобс»</footer>
</template>
