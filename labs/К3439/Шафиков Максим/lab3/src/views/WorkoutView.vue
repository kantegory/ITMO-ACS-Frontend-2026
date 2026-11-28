<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import { today } from '../format.js';
import { catalogRoute } from '../router.js';
import { useAction } from '../composables/useAction.js';
import { useResource } from '../composables/useResource.js';
import { useSession } from '../composables/useSession.js';
import LoadState from '../components/LoadState.vue';
import WorkoutMeta from '../components/WorkoutMeta.vue';
import WorkoutVideo from '../components/WorkoutVideo.vue';

const id = useRoute().params.id;
const { profile, restoring } = useSession();
const { data: workout, pending, error, reload } = useResource(() => api.workout(id));
const {
  data: activity, pending: activityPending, error: activityError, reload: reloadActivity,
} = useResource(api.activity, () => profile.value?.id);
const { pending: saving, error: saveError, run } = useAction();
const feedback = ref('');
const completed = computed(() =>
  activity.value?.completed.some(entry => entry.workout === id && entry.date === today()) ?? false,
);

watch(workout, value => {
  if (value) document.title = value.title + ' — Качалочка';
});

function markCompleted() {
  return run(() => api.completeWorkout(id), result => {
    activity.value = result;
    feedback.value = 'Тренировка добавлена в историю.';
  });
}
</script>

<template>
  <section class="container site-width page-content">
    <RouterLink class="back-link" :to="catalogRoute">К каталогу тренировок</RouterLink>
    <LoadState :pending="pending" :error="error" @retry="reload">
      <template v-if="workout">
        <div class="detail-top">
          <p class="category">{{ workout.type }}</p>
          <h1>{{ workout.title }}</h1>
          <p class="muted">{{ workout.description }}</p>
          <WorkoutMeta :workout="workout" />
        </div>
        <div class="detail-layout">
          <WorkoutVideo :workout="workout" />
          <section class="guide">
            <h2>Как заниматься</h2>
            <p class="muted">Инвентарь · {{ workout.equipment }}</p>
            <ol>
              <li v-for="step in workout.steps" :key="step">{{ step }}</li>
            </ol>
            <p v-if="restoring" class="muted" role="status">Проверка сессии…</p>
            <template v-else-if="profile">
              <RouterLink class="btn btn-outline-secondary mt-2"
                :to="{ name: 'account', query: { plan: workout.id } }">Добавить в план</RouterLink>
              <div class="mt-2">
                <LoadState :pending="activityPending" :error="activityError" @retry="reloadActivity">
                  <button class="btn btn-primary" type="button" :disabled="completed || saving" @click="markCompleted">
                    {{ completed ? 'Выполнено сегодня' : 'Отметить выполненной' }}
                  </button>
                </LoadState>
              </div>
              <p class="muted mt-2" role="status">{{ feedback }}</p>
              <p v-if="saveError" class="form-error" role="alert">{{ saveError }}</p>
            </template>
            <RouterLink v-else class="btn btn-outline-secondary mt-3"
              :to="{ name: 'login', query: { workout: workout.id } }">Войти, чтобы сохранить прогресс</RouterLink>
          </section>
        </div>
      </template>
      <h1 v-else>Тренировка не найдена</h1>
    </LoadState>
  </section>
</template>
