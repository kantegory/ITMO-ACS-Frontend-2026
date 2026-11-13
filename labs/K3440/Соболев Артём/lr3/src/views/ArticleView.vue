<script setup>
import { watch } from "vue";
import { useAsync } from "../composables/useAsync.js";
import { useRoute } from "vue-router";
import api from "../api.js";
import RequestState from "../components/RequestState.vue";
const route = useRoute();
const {
  data: article,
  loading,
  error,
  execute,
} = useAsync(() => api.get("/articles/" + encodeURIComponent(route.params.id)));
execute();
watch(article, (value) => {
  if (value) document.title = value.title + " - Fitness Platform";
});
</script>
<template>
  <div class="container article-back-wrap">
    <RouterLink class="article-back" to="/blog">Все статьи</RouterLink>
    <RequestState :loading="loading" :error="error" @retry="execute">
      <article v-if="article">
        <header class="inner-hero">
          <span class="eyebrow">
            {{ article.category }} | {{ article.readingTime }} МИНУТ ЧТЕНИЯ
          </span>
          <h1>{{ article.title }}</h1>
          <p>{{ article.description }}</p>
        </header>
        <img
          class="article-cover"
          :src="'/' + article.image"
          :alt="article.alt"
        />
        <div class="article-body">
          <p v-for="(paragraph, index) in article.content" :key="index">
            {{ paragraph }}
          </p>
        </div>
      </article>
    </RequestState>
  </div>
</template>
