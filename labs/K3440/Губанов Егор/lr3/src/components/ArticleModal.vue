<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { api } from '../api/index.js'
import { useRequest } from '../composables/useRequest.js'
import StatusMessage from './StatusMessage.vue'

const props = defineProps({ articleId: { type: String, required: true } })
const emit = defineEmits(['close'])
const dialog = ref(null)
const { data: article, loading, error, execute } = useRequest(signal => api.getArticle(props.articleId, signal))

onMounted(() => dialog.value.showModal())
onBeforeUnmount(() => dialog.value?.close())

function closeOnBackdrop(event) {
  if (event.target === dialog.value) emit('close')
}

execute()
</script>

<template>
  <Teleport to="body">
    <dialog ref="dialog" class="article-dialog" aria-labelledby="articleTitle" @cancel.prevent="emit('close')"
            @close="emit('close')" @click="closeOnBackdrop">
      <div class="p-4">
        <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
          <h2 id="articleTitle" class="h3">{{ article?.title || 'Статья' }}</h2>
          <button class="btn btn-brutal btn-paper" type="button" autofocus @click="emit('close')">Закрыть</button>
        </div>
        <StatusMessage :message="error || (loading ? 'Загружаем статью…' : '')" :error="Boolean(error)" />
        <button v-if="error" class="btn btn-brutal btn-paper" type="button" @click="execute()">Повторить</button>
        <template v-if="article">
          <section v-for="(section, index) in article.sections" :key="index">
            <h3 class="h5">{{ section.heading }}</h3>
            <p>{{ section.text }}</p>
          </section>
        </template>
      </div>
    </dialog>
  </Teleport>
</template>