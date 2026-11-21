<script setup>
import { ref, watch, nextTick } from 'vue'
import { api } from '../api/index.js'
import { CATEGORIES } from '../constants.js'
import { useRequest } from '../composables/useRequest.js'
import ArticleCard from '../components/ArticleCard.vue'
import ArticleModal from '../components/ArticleModal.vue'
import StatusMessage from '../components/StatusMessage.vue'

const category = ref('')
const selectedId = ref('')
let articleTrigger

function openArticle(id, trigger) {
  articleTrigger = trigger
  selectedId.value = id
}

async function closeArticle() {
  if (!selectedId.value) return

  const trigger = articleTrigger
  articleTrigger = undefined
  selectedId.value = ''
  await nextTick()

  if (trigger?.isConnected) trigger.focus()
}

const { data: articles, loading, error, execute } = useRequest(signal => api.getArticles(category.value, signal))
watch(category, () => execute())
execute()
</script>

<template>
  <p class="eyebrow">Практика · питание · отдых</p>
  <h1 class="display-title mb-4">Блог о движении</h1>
  <div class="d-flex flex-wrap gap-3 mb-4" role="group" aria-label="Темы статей">
    <button class="btn btn-brutal btn-paper blog-filter" :class="{ active: category === '' }" type="button"
            :aria-pressed="category === ''" @click="category = ''">Все темы</button>
    <button v-for="(title, key) in CATEGORIES" :key="key" class="btn btn-brutal btn-paper blog-filter"
            :class="{ active: category === key }" type="button" :aria-pressed="category === key" @click="category = key">{{ title }}</button>
  </div>
  <StatusMessage :message="error || (loading ? 'Загружаем статьи…' : '')" :error="Boolean(error)" />
  <button v-if="error" class="btn btn-brutal btn-paper mb-3" type="button" @click="execute()">Повторить</button>
  <StatusMessage v-if="articles && !articles.length" message="В этой категории пока нет статей." />
  <section class="row g-4" aria-label="Список статей" :aria-busy="loading">
    <div v-for="article in articles || []" :key="article.id" class="col-12 col-md-6 col-xl-4">
      <ArticleCard :article="article" @open="openArticle" />
    </div>
  </section>
  <ArticleModal v-if="selectedId" :key="selectedId" :article-id="selectedId" @close="closeArticle" />
</template>