<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api/index.js'
import { DAYS } from '../constants.js'
import { useAuth } from '../composables/useAuth.js'
import { useRequest } from '../composables/useRequest.js'
import { usePlan } from '../composables/usePlan.js'
import StatusMessage from '../components/StatusMessage.vue'
import SessionTimer from '../components/SessionTimer.vue'
import ParticipantList from '../components/ParticipantList.vue'

const route = useRoute()
const { user, refreshUser } = useAuth()
const { data: training, loading, error, execute } = useRequest(async signal => {
  const [, item] = await Promise.all([refreshUser(signal), api.getTraining(route.params.id, signal)])
  return item
})
const { saving, error: saveError, message, finish, resetStatus } = usePlan()
const finished = ref(false)
const saved = ref(false)
const day = computed(() => typeof route.query.day === 'string' ? route.query.day : '')
const canSave = computed(() => Object.hasOwn(DAYS, day.value) && user.value?.plan?.some(item =>
    item.day === day.value && item.trainingId === training.value?.id
))
const participants = computed(() => user.value && training.value
    ? [`${user.value.name} (ты)`, ...training.value.participants]
    : [])

async function saveResult() {
  saved.value = await finish(day.value, training.value.id)
}

function restart() {
  finished.value = false
  saved.value = false
  resetStatus()
}

execute()
</script>

<template>
  <StatusMessage :message="error || (loading ? 'Загружаем комнату…' : '')" :error="Boolean(error)" />
  <button v-if="error" class="btn btn-brutal btn-paper" type="button" @click="execute()">Повторить</button>
  <div v-if="training && user">
    <p class="eyebrow">Комната занятия</p>
    <h1 class="display-title mb-4">{{ training.title }}</h1>
    <p class="lead-copy">Демонстрационная комната: таймер работает у тебя в браузере. Состав группы ниже приведён для примера.</p>
    <div class="row g-4">
      <div class="col-12 col-lg-8">
        <SessionTimer :steps="training.steps" @finished="finished = true" @restart="restart" />
        <button v-if="finished && canSave" class="btn btn-brutal btn-clay mt-4" type="button"
                :disabled="saving || saved" @click="saveResult">{{ saved ? 'Результат сохранён' : 'Засчитать занятие в план' }}</button>
        <StatusMessage :message="saveError || message" :error="Boolean(saveError)" />
        <p class="small mt-3">Чтобы засчитать результат, открывай комнату кнопкой «Начать» из личного плана. Таймер не управляет видеозаписью.</p>
      </div>
      <aside class="col-12 col-lg-4">
        <section class="brutal-card p-4">
          <h2 class="h3">Пример группы</h2>
          <ParticipantList :names="participants" />
          <RouterLink class="btn btn-brutal btn-lilac w-100 mt-4" :to="{ name: 'training', params: { id: training.id } }">
            Описание и видео
          </RouterLink>
          <RouterLink class="btn btn-brutal btn-clay w-100 mt-3" to="/profile">Мой план</RouterLink>
        </section>
      </aside>
    </div>
  </div>
</template>