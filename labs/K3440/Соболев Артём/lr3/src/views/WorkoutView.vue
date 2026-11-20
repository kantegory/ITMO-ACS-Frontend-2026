<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api.js";
import { useAuthStore } from "../stores/auth.js";
import { useAsync } from "../composables/useAsync.js";

import RequestState from "../components/RequestState.vue";
const route = useRoute(),
  router = useRouter();
const {
  data: workout,
  loading,
  error,
  execute,
} = useAsync(() => api.get("/workouts/" + encodeURIComponent(route.params.id)));
execute();
const auth = useAuthStore();
const recorded = ref(false);
const {
  loading: saving,
  error: saveError,
  execute: saveWorkout,
} = useAsync(async () => {
  try {
    await api.post("/sessions", {
      workoutId: workout.value.id,
      userId: auth.user.id,
    });
    recorded.value = true;
  } catch (e) {
    if ([401, 403].includes(e.status)) {
      auth.logout();
      router.push({ path: "/login", query: { next: route.fullPath } });
    }
    throw e;
  }
});
async function complete() {
  if (!auth.authenticated)
    return router.push({ path: "/login", query: { next: route.fullPath } });
  await saveWorkout();
}
watch(workout, (value) => {
  if (value) document.title = value.title + " - Fitness Platform";
});
</script>
<template>
  <section class="container">
    <div class="article-back-wrap">
      <RouterLink class="article-back" to="/workouts">
        Все тренировки
      </RouterLink>
    </div>
    <RequestState :loading="loading" :error="error" @retry="execute">
      <template v-if="workout">
        <header class="inner-hero">
          <span class="eyebrow">
            {{ workout.category }} | {{ workout.level }}
          </span>
          <h1>{{ workout.title }}</h1>
          <p>{{ workout.description }}</p>
          <span class="detail-pill">{{ workout.duration }} минут</span>
          <span class="detail-pill">{{ workout.equipment }}</span>
        </header>
        <img
          v-if="workout.image"
          class="workout-detail-art"
          :src="'/' + workout.image"
          :alt="workout.title"
        />
        <section class="section">
          <h2>План тренировки</h2>
          <ul class="workout-plan">
            <li v-for="step in workout.plan" :key="step">{{ step }}</li>
          </ul>
          <div class="detail-actions">
            <a
              v-if="workout.videoUrl"
              class="btn btn-outline-dark"
              :href="workout.videoUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Смотреть видео
            </a>
            <button
              class="btn btn-dark"
              :disabled="saving || recorded"
              @click="complete"
            >
              {{
                recorded
                  ? "Тренировка записана"
                  : saving
                    ? "Сохранение…"
                    : "Завершить тренировку"
              }}
            </button>
          </div>
          <p v-if="recorded" class="status-success" role="status">
            Тренировка записана в историю.
            <RouterLink to="/history">Посмотреть историю</RouterLink>
          </p>
          <p v-if="saveError" class="form-error" role="alert">
            {{ saveError }}
          </p>
        </section>
      </template>
    </RequestState>
  </section>
</template>
