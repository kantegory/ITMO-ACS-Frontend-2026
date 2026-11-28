<script setup>
import { api } from '../api.js';
import { photoUrl } from '../format.js';
import { articleRoute } from '../router.js';
import LoadState from '../components/LoadState.vue';
import { useResource } from '../composables/useResource.js';

const { data: articles, pending, error, reload } = useResource(api.articles);
</script>

<template>
  <section class="container site-width page-content">
    <h1>Журнал</h1>
    <p class="muted">О питании, восстановлении и привычках, которые помогают заниматься регулярно.</p>
    <LoadState :pending="pending" :error="error" @retry="reload">
      <div v-if="articles?.length" class="blog-list">
        <article v-for="article in articles" :key="article.id" class="blog-row">
          <img :src="photoUrl(article.image)" alt="" width="512" height="512">
          <div>
            <p class="category">{{ article.topic }}</p>
            <h2><RouterLink :to="articleRoute(article.id)">{{ article.title }}</RouterLink></h2>
            <p class="muted">{{ article.summary }}</p>
          </div>
        </article>
      </div>
      <p v-else class="empty">В журнале пока нет статей.</p>
    </LoadState>
  </section>
</template>
