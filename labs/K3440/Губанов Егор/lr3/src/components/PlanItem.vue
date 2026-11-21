<script setup>
import { DAYS, TYPES } from '../constants.js'
const props = defineProps({
  item: { type: Object, required: true },
  training: { type: Object, required: true },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['toggle', 'remove'])
function changeCompletion(event) {
  const input = event.currentTarget
  const completed = input.checked
  input.checked = props.item.completed
  emit('toggle', completed)
}
</script>

<template>
  <article class="brutal-card p-3">
    <p class="eyebrow">{{ DAYS[item.day] }}</p>
    <h3 class="h4">{{ training.title }}</h3>
    <p>{{ TYPES[training.type] }} · {{ training.minutes }} мин</p>
    <label class="d-flex align-items-center gap-2 mb-3">
      <input class="form-check-input mt-0" type="checkbox" :checked="item.completed" :disabled="disabled"
             @change="changeCompletion">
      Занятие выполнено
    </label>
    <div class="d-flex gap-2 flex-wrap">
      <RouterLink class="btn btn-brutal btn-sage" :to="{ name: 'session', params: { id: training.id }, query: { day: item.day } }">
        Начать
      </RouterLink>
      <button class="btn btn-brutal btn-paper" type="button" :disabled="disabled" @click="emit('remove')">Убрать</button>
    </div>
  </article>
</template>