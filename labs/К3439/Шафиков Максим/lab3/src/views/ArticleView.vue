<script setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import { photoUrl } from '../format.js';
import LoadState from '../components/LoadState.vue';
import { useResource } from '../composables/useResource.js';

const route = useRoute();
const id = route.params.id;
const { data: article, pending, error, reload } = useResource(() => api.article(id));

watch(article, value => {
  if (value) document.title = value.title + ' — Качалочка';
});
</script>

<template>
  <section class="container site-width page-content">
    <RouterLink class="back-link" :to="{ name: 'blog' }">К списку статей</RouterLink>
    <LoadState :pending="pending" :error="error" @retry="reload">
      <article v-if="article" class="article">
        <p class="category">{{ article.topic }}</p>
        <h1 class="mt-2">{{ article.title }}</h1>
        <p class="muted">{{ article.summary }}</p>
        <img :src="photoUrl(article.image)" alt="" width="512" height="512">
        <section v-for="([heading, text], index) in article.sections" :key="index">
          <h2>{{ heading }}</h2>
          <p>{{ text }}</p>
        </section>
      </article>
      <h1 v-else>Статья не найдена</h1>
    </LoadState>
  </section>
</template>
