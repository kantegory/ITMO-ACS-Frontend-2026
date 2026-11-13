<script setup>
import { ref, computed } from "vue";
import api from "../api.js";
import { useAsync } from "../composables/useAsync.js";
import RequestState from "../components/RequestState.vue";
import WorkoutCard from "../components/WorkoutCard.vue";
const { data, loading, error, execute } = useAsync(
  () => api.get("/workouts"),
  [],
);
execute();
const search = ref(""),
  level = ref(""),
  category = ref(""),
  duration = ref("");
const categories = computed(() => [
  ...new Set(data.value.map((w) => w.category)),
]);
const filtered = computed(() =>
  data.value.filter(
    (w) =>
      w.title.toLowerCase().includes(search.value.trim().toLowerCase()) &&
      (!level.value || w.level === level.value) &&
      (!category.value || w.category === category.value) &&
      (!duration.value || w.duration <= Number(duration.value)),
  ),
);
</script>
<template>
  <section class="inner-hero container">
    <h1>Тренировки</h1>
    <p>Выберите подходящую тренировку по уровню, направлению и времени.</p>
  </section>
  <section class="container">
    <div class="filters">
      <label>
        Поиск
        <input
          v-model="search"
          type="search"
          class="form-control"
          placeholder="Название тренировки"
        />
      </label>
      <label>
        Уровень
        <select v-model="level" class="form-select">
          <option value="">Все уровни</option>
          <option>Начальный</option>
          <option>Средний</option>
          <option>Продвинутый</option>
        </select>
      </label>
      <label>
        Направление
        <select v-model="category" class="form-select">
          <option value="">Все направления</option>
          <option v-for="item in categories" :key="item">{{ item }}</option>
        </select>
      </label>
      <label>
        Длительность
        <select v-model="duration" class="form-select">
          <option value="">Любая</option>
          <option value="20">До 20 минут</option>
          <option value="30">До 30 минут</option>
          <option value="40">До 40 минут</option>
        </select>
      </label>
    </div>
    <RequestState :loading="loading" :error="error" @retry="execute">
      <p role="status">Найдено: {{ filtered.length }}</p>
      <div class="row g-4">
        <WorkoutCard
          v-for="workout in filtered"
          :key="workout.id"
          :workout="workout"
        />
      </div>
      <p v-if="!filtered.length" class="empty-state">
        Тренировок по выбранным условиям нет.
      </p>
    </RequestState>
  </section>
</template>
