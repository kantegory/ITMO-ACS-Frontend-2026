<script setup>
import { watch } from 'vue'
import { useTimer } from '../composables/useTimer.js'

const props = defineProps({ steps: { type: Array, required: true } })
const emit = defineEmits(['finished', 'restart'])
const { index, running, finished, formatted, toggle, next } = useTimer(props.steps)

watch(finished, value => emit(value ? 'finished' : 'restart'))
</script>

<template>
  <section class="brutal-card p-4 text-center mb-4" aria-label="Таймер занятия">
    <p class="eyebrow">Осталось в текущем этапе</p>
    <div class="timer-display" role="timer" aria-label="Оставшееся время">{{ formatted }}</div>
    <p class="h3 my-3" aria-live="polite">{{ finished ? 'Занятие завершено!' : steps[index]?.title }}</p>
    <div class="d-flex justify-content-center gap-3 flex-wrap">
      <button class="btn btn-brutal btn-sage" type="button" :disabled="!steps.length" @click="toggle">
        {{ running ? 'Пауза' : finished ? 'Начать заново' : 'Начать / продолжить' }}
      </button>
      <button class="btn btn-brutal btn-lilac" type="button" :disabled="finished" @click="next">
        {{ index === steps.length - 1 ? 'Завершить' : 'Следующий этап' }}
      </button>
    </div>
  </section>
  <section class="brutal-card p-4">
    <h2 class="h3">Этапы занятия</h2>
    <ol class="instruction-list mb-0">
      <li v-for="(step, position) in steps" :key="position" :class="{ 'current-step': !finished && position === index }"
          :aria-current="!finished && position === index ? 'step' : undefined">{{ step.title }}</li>
    </ol>
  </section>
</template>