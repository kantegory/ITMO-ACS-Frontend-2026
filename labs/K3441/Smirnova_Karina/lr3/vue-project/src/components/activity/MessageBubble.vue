<script setup>
import { formatTime } from '@/utils/formatters'
defineProps({ message: { type: Object, required: true }, own: Boolean })
</script>

<template>
  <div v-if="message.type === 'event'" class="message-event">{{ message.text }}</div>
  <div v-else :class="['message', own ? 'out' : 'in']">
    <span>{{ message.text }}</span
    ><small>{{ formatTime(message.createdAt) }}</small>
  </div>
</template>

<style scoped>
.message {
  max-width: 72%;
  padding: 10px 13px;
  border-radius: 14px;
  background: var(--rs-surface-soft);
}
.message.out {
  align-self: flex-end;
  background: var(--rs-primary);
  color: #fff;
}
.message small {
  display: block;
  margin-top: 3px;
  opacity: 0.72;
  text-align: right;
}
.message-event {
  align-self: center;
  color: var(--rs-muted);
  font-size: 13px;
}
</style>
