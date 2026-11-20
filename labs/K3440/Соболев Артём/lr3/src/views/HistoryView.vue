<script setup>
import { useProgress } from "../composables/useProgress.js";
import RequestState from "../components/RequestState.vue";
import SessionList from "../components/SessionList.vue";
const { sessions, loading, error, execute } = useProgress();
</script>
<template>
  <section class="inner-hero container">
    <RouterLink to="/account">← Мой прогресс</RouterLink>
    <h1>История тренировок</h1>
  </section>
  <section class="container">
    <RequestState :loading="loading" :error="error" @retry="execute">
      <SessionList :sessions="sessions" />
    </RequestState>
  </section>
</template>
