<template>
  <button
    type="button"
    class="btn"
    :class="following ? 'btn-outline-primary' : 'btn-primary'"
    :disabled="busy"
    :aria-pressed="String(following)"
    @click="toggle"
  >
    {{ following ? 'Вы подписаны' : 'Подписаться' }}
  </button>
</template>

<script setup>
defineProps({
  following: { type: Boolean, required: true },
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

function toggle() {
  emit('toggle')
}
</script>
