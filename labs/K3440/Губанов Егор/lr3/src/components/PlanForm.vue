<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { DAYS } from '../constants.js'
import { useAuth } from '../composables/useAuth.js'
import { usePlan } from '../composables/usePlan.js'
import StatusMessage from './StatusMessage.vue'

const props = defineProps({ trainingId: { type: String, required: true } })
const route = useRoute()
const day = ref('monday')
const { isAuthenticated } = useAuth()
const { saving, error, message, add, resetStatus } = usePlan()
</script>

<template>
  <section class="brutal-card p-4">
    <h2 class="h3">Добавить в мой план</h2>
    <form v-if="isAuthenticated" @submit.prevent="add(day, props.trainingId)">
      <label class="form-label" for="planDay">День недели</label>
      <select id="planDay" v-model="day" class="form-select mb-3" :disabled="saving" @change="resetStatus">
        <option v-for="(title, key) in DAYS" :key="key" :value="key">{{ title }}</option>
      </select>
      <p class="small">Одно занятие на день. Новый выбор заменит предыдущее занятие этого дня.</p>
      <button class="btn btn-brutal btn-clay w-100" type="submit" :disabled="saving">
        {{ saving ? 'Сохраняем…' : 'Сохранить в план' }}
      </button>
    </form>
    <RouterLink v-else class="btn btn-brutal btn-clay w-100" :to="{ name: 'login', query: { next: route.fullPath } }">
      Войти и добавить в план
    </RouterLink>
    <StatusMessage :message="error || message" :error="Boolean(error)" />
    <RouterLink v-if="message && !saving" class="btn btn-brutal btn-paper mt-2" :to="{ name: 'profile' }">
      Открыть мой план
    </RouterLink>
  </section>
</template>