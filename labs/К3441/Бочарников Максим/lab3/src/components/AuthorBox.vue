<template>
  <div class="author-box">
    <img :src="author.avatar" :alt="author.name" width="64" height="64">
    <div class="flex-grow-1">
      <strong class="display" style="font-size: 1.35rem">{{ author.name }}</strong>
      <div class="profile-handle">{{ author.handle }}</div>
      <p class="mb-0 small mt-1">{{ author.bio || '' }}</p>
    </div>
    <button
      type="button"
      class="btn btn-vice"
      :class="following ? 'btn-vice-primary' : 'btn-vice-teal'"
      :disabled="busy"
      @click="$emit('toggle-follow')"
    >
      {{ following ? 'Вы подписаны' : 'Подписаться' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  author: { type: Object, required: true },
  following: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
})

defineEmits(['toggle-follow'])
</script>
