<script setup>
import { computed, reactive, ref } from 'vue';
import { api } from '../api.js';
import { catalogRoute } from '../router.js';
import { useResource } from '../composables/useResource.js';
import LoadState from '../components/LoadState.vue';
import WorkoutCard from '../components/WorkoutCard.vue';
import WorkoutFilters from '../components/WorkoutFilters.vue';

const { data: workouts, error, pending, reload } = useResource(api.workouts);
const empty = { search: '', type: '', level: '', duration: '' };
const filters = reactive({ ...empty });
const filterPanel = ref(null);
const hasFilters = computed(() => Object.values(filters).some(Boolean));

const durations = {
  short: minutes => minutes <= 15,
  medium: minutes => minutes >= 16 && minutes <= 25,
  long: minutes => minutes >= 26,
};

const results = computed(() => {
  const { search, type, level, duration } = filters;
  const query = search.trim().toLocaleLowerCase('ru');
  return (workouts.value ?? []).filter(workout => {
    const searchable = [workout.title, workout.description, ...workout.steps].join(' ').toLocaleLowerCase('ru');
    return searchable.includes(query) &&
      (!type || workout.type === type) &&
      (!level || workout.level === level) &&
      (!duration || durations[duration](workout.minutes));
  });
});

function resetFilters() {
  Object.assign(filters, empty);
  filterPanel.value.querySelector('input').focus();
}
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="container site-width hero-layout">
      <div class="hero-copy">
        <h1 id="hero-title">Тренировки дома</h1>
        <p>Подберите занятие по типу нагрузки, уровню и времени.</p>
        <RouterLink class="btn btn-primary" :to="catalogRoute">Подобрать тренировку</RouterLink>
      </div>
      <img class="hero-image" src="/assets/images/hero.webp" alt="Двое мужчин бегут по дорожке в парке"
        width="1376" height="768" fetchpriority="high">
    </div>
  </section>

  <section id="catalog" class="container site-width catalog" aria-labelledby="catalog-title">
    <h2 id="catalog-title">Каталог тренировок</h2>
    <p class="muted mb-4">Найдите занятие по типу нагрузки, уровню и длительности.</p>
    <LoadState :pending="pending" :error="error" @retry="reload">
      <div ref="filterPanel">
        <WorkoutFilters v-model:search="filters.search" v-model:type="filters.type"
          v-model:level="filters.level" v-model:duration="filters.duration" />
      </div>
      <div class="result-line">
        <p role="status">Найдено тренировок: {{ results.length }}</p>
        <button v-if="hasFilters" class="text-button" type="button" @click="resetFilters">Сбросить фильтры</button>
      </div>
      <div v-if="results.length" class="row g-4">
        <div v-for="workout in results" :key="workout.id" class="col-sm-6 col-lg-4">
          <WorkoutCard :workout="workout" />
        </div>
      </div>
      <p v-else class="empty">По этим условиям ничего не найдено. Измените поиск или сбросьте фильтры.</p>
    </LoadState>
  </section>
</template>
