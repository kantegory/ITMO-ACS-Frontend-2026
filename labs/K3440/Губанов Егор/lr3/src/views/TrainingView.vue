<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api/index.js'
import { TYPES, LEVELS } from '../constants.js'
import { useRequest } from '../composables/useRequest.js'
import PlanForm from '../components/PlanForm.vue'
import StatusMessage from '../components/StatusMessage.vue'

const route = useRoute()
const { data: training, loading, error, errorStatus, execute } =
    useRequest(signal => api.getTraining(route.params.id, signal))

const catalogLink = computed(() => ({ name: 'catalog', query: route.query }))
const missing = computed(() => errorStatus.value === 404)
const videoId = computed(() => /^[\w-]{11}$/.test(training.value?.videoId || '') ? training.value.videoId : '')

watch(training, value => {
  if (value) document.title = `${value.title} — Вместе`
})

execute()
</script>

<template>
  <RouterLink v-if="!missing" :to="catalogLink">← Все занятия</RouterLink>

  <StatusMessage
      :message="missing ? 'Тренировка не найдена.' : error || (loading ? 'Загружаем тренировку…' : '')"
      :error="Boolean(error)"
  />

  <RouterLink v-if="missing" class="btn btn-brutal btn-paper" :to="catalogLink">
    К занятиям
  </RouterLink>

  <button v-else-if="error" class="btn btn-brutal btn-paper mt-3" type="button" @click="execute()">
    Повторить
  </button>
  <div v-if="training">
    <p class="eyebrow mt-4">{{ TYPES[training.type] }} · {{ LEVELS[training.level] }} уровень · {{ training.minutes }} мин</p>
    <h1 class="display-title mb-4">{{ training.title }}</h1>
    <div class="row g-4">
      <div class="col-12 col-lg-8">
        <div v-if="videoId" class="ratio ratio-16x9 video-frame">
          <iframe :src="`https://www.youtube-nocookie.com/embed/${videoId}`"
                  :title="`${training.title}: видео тренировки`" allow="encrypted-media; picture-in-picture; fullscreen"
                  referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
        <p class="small mt-3">
          Автор видео: {{ training.videoAuthor }}
          <a v-if="videoId" :href="`https://www.youtube.com/watch?v=${videoId}`" target="_blank" rel="noopener noreferrer">
            Открыть на YouTube
          </a>
        </p>
        <section class="my-4">
          <h2 class="h3">О практике</h2>
          <p>{{ training.description }}</p>
        </section>
        <section class="brutal-card p-4">
          <h2 class="h3">Что понадобится</h2>
          <ul class="mb-0">
            <li v-for="item in training.equipment" :key="item">{{ item }}</li>
          </ul>
        </section>
      </div>
      <aside class="col-12 col-lg-4">
        <section class="brutal-card p-4 mb-4">
          <h2 class="h3">План занятия</h2>
          <ol class="instruction-list">
            <li v-for="(step, index) in training.steps" :key="index">{{ step.title }} — {{ step.seconds / 60 }} мин</li>
          </ol>
          <RouterLink class="btn btn-brutal btn-sage w-100" :to="{ name: 'session', params: { id: training.id } }">
            Открыть комнату
          </RouterLink>
          <p class="small mt-3 mb-0">У таймера свой план этапов. С видеозаписью он не синхронизирован.</p>
        </section>
        <PlanForm :training-id="training.id" />
      </aside>
    </div>
  </div>
</template>