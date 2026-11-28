<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'danger' },
})

const role = computed(() => (props.type === 'danger' ? 'alert' : 'status'))
</script>

<template>
  <p v-if="message" :class="['alert', `alert-${type}`]" :role="role">
    {{ message }}
  </p>
</template>
