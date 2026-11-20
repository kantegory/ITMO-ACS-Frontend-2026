<script setup>
import { ref, computed } from "vue";
import api from "../api.js";
import { useAsync } from "../composables/useAsync.js";
import RequestState from "../components/RequestState.vue";
import ArticleCard from "../components/ArticleCard.vue";
const { data, loading, error, execute } = useAsync(
  () => api.get("/articles"),
  [],
);
execute();
const expanded = ref(false);
const visible = computed(() =>
  expanded.value ? data.value : data.value.slice(0, 3),
);
</script>
<template>
  <section class="inner-hero container">
    <h1>Блог о здоровье и питании</h1>
    <p>Статьи о движении, восстановлении и полезных привычках.</p>
  </section>
  <section class="container">
    <RequestState :loading="loading" :error="error" @retry="execute">
      <div id="articles" class="row g-4">
        <ArticleCard
          v-for="article in visible"
          :key="article.id"
          :article="article"
        />
      </div>
      <p v-if="!data.length" class="empty-state">Статей пока нет.</p>
      <button
        v-if="data.length > 3"
        class="all-items-button"
        :aria-expanded="expanded"
        aria-controls="articles"
        @click="expanded = !expanded"
      >
        {{ expanded ? "Скрыть дополнительные статьи" : "Читать больше статей" }}
      </button>
    </RequestState>
  </section>
</template>
