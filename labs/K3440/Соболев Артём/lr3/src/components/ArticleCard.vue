<script setup>
defineProps({ article: { type: Object, required: true } });
</script>
<template>
  <div class="col-md-6 col-lg-4">
    <RouterLink class="article-card d-block" :to="'/blog/' + article.id">
      <img
        class="article-card-image"
        :src="'/' + article.image"
        :alt="article.alt"
        loading="lazy"
      />
      <div class="article-card-content">
        <span class="eyebrow">
          {{ article.category }} | {{ article.readingTime }} МИН
        </span>
        <h2>{{ article.title }}</h2>
        <p>{{ article.description }}</p>
      </div>
    </RouterLink>
  </div>
</template>
