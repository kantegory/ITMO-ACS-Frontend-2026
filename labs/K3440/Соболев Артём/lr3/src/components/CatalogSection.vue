<script setup>
import { computed } from "vue";
import api from "../api.js";
import { useAsync } from "../composables/useAsync.js";
import RequestState from "./RequestState.vue";
import WorkoutCard from "./WorkoutCard.vue";
import ArticleCard from "./ArticleCard.vue";
const props = defineProps({
  kind: { type: String, required: true },
  title: { type: String, required: true },
});
const { data, loading, error, execute } = useAsync(
  () => api.get("/" + props.kind),
  [],
);
execute();
const workouts = computed(() => props.kind === "workouts");
</script>
<template>
  <section class="section container">
    <div class="section-heading">
      <h2>{{ title }}</h2>
    </div>
    <RequestState :loading="loading" :error="error" @retry="execute">
      <div class="row g-4">
        <component
          :is="workouts ? WorkoutCard : ArticleCard"
          v-for="item in data.slice(0, 3)"
          :key="item.id"
          v-bind="workouts ? { workout: item } : { article: item }"
        />
      </div>
      <p v-if="!data.length" class="empty-state">Пока ничего нет.</p>
    </RequestState>
    <RouterLink class="all-items-button" :to="workouts ? '/workouts' : '/blog'">
      {{ workouts ? "Все тренировки" : "Все статьи" }}
    </RouterLink>
  </section>
</template>
