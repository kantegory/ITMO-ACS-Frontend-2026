<template>
  <div>
    <p v-if="!comments.length" class="text-muted mb-0">
      Пока тихо — будь первым, кто оставит комментарий.
    </p>
    <article v-for="c in comments" :key="c.id" class="comment">
      <div class="comment__head">
        <span class="comment__author">{{ c.author }}</span>
        <time>{{ c.date }}</time>
      </div>
      <p class="mb-0">{{ c.text }}</p>
    </article>
  </div>
</template>

<script setup>
defineProps({
  comments: { type: Array, default: () => [] },
})
</script>
