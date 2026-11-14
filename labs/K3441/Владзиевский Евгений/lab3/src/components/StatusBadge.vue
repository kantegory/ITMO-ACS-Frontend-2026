<script setup>
import { computed } from 'vue';

const VIEWS = {
  active: ['status-ok', 'Действует'],
  wait: ['status-warn', 'Ждёт подписи'],
  done: ['status-off', 'Завершена'],
  cancel: ['status-danger', 'Отменена'],
  new: ['status-info', 'Новая заявка'],
  confirmed: ['status-ok', 'Подтверждена'],
  published: ['status-info', 'Опубликовано']
};

const props = defineProps({
  status: { type: String, required: true },
  label: { type: String, default: '' }
});

const view = computed(() => VIEWS[props.status] || ['status-info', props.status]);
</script>

<template>
  <span class="status" :class="view[0]">{{ label || view[1] }}</span>
</template>
