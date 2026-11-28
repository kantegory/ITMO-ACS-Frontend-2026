<template>
  <button
    type="button"
    class="btn-like"
    :class="{ 'is-liked': liked }"
    :aria-pressed="liked"
    :aria-label="label"
    :disabled="busy"
    @click="onClick"
  >
    <Icon :name="liked ? 'heart' : 'heart-outline'" class-name="heart" />
    <span class="like-count">{{ formatLikes(likes) }}</span>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import Icon from '@/components/Icon.vue'
import { useLikes, formatLikes } from '@/composables/useLikes'

const props = defineProps({
  recipeId: { type: [Number, String], required: true },
  title: { type: String, default: '' },
  likes: { type: Number, default: 0 },
  liked: { type: Boolean, default: false },
})

const emit = defineEmits(['update'])

const { toggleLike } = useLikes()
const busy = ref(false)

const label = computed(
  () =>
    `${props.liked ? 'Убрать лайк' : 'Поставить лайк'}${
      props.title ? `: ${props.title}` : ''
    }`
)

async function onClick() {
  busy.value = true
  try {
    const result = await toggleLike(props.recipeId, props.likes)
    if (result) emit('update', result)
  } finally {
    busy.value = false
  }
}
</script>
