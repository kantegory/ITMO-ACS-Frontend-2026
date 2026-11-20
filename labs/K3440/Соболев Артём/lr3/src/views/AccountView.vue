<script setup>
import { useAuthStore } from "../stores/auth.js";
import { useProgress } from "../composables/useProgress.js";
import RequestState from "../components/RequestState.vue";
import SessionList from "../components/SessionList.vue";
import CatalogSection from "../components/CatalogSection.vue";
const auth = useAuthStore();
const { sessions, stats, loading, error, execute } = useProgress();
</script>
<template>
  <section class="inner-hero container">
    <h1>Мой прогресс</h1>
    <p>Здравствуйте, {{ auth.user?.name }}</p>
  </section>
  <section class="container">
    <RequestState :loading="loading" :error="error" @retry="execute">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="stat-card">
            <small>Тренировок за месяц</small>
            <strong>{{ stats.month }}</strong>
            <span>по данным истории</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card">
            <small>Занятий за неделю</small>
            <strong>{{ stats.week }}</strong>
            <span>за последние 7 дней</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card">
            <small>Цель на неделю</small>
            <strong>{{ stats.goal }} из 4</strong>
            <span>
              {{
                stats.remaining
                  ? "Осталось: " + stats.remaining
                  : "Цель достигнута"
              }}
            </span>
          </div>
        </div>
      </div>
      <section class="account-section">
        <h2>История ваших тренировок</h2>
        <SessionList :sessions="sessions.slice(0, 3)" />
        <RouterLink class="all-items-button" to="/history">
          Вся история
        </RouterLink>
      </section>
    </RequestState>
  </section>
  <CatalogSection kind="workouts" title="Рекомендуемые тренировки" />
  <CatalogSection kind="articles" title="Рекомендуемые статьи" />
</template>
