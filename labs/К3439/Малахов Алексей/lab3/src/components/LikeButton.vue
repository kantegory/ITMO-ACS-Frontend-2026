<template>
  <button
    type="button"
    class="btn btn-outline-secondary btn-like"
    :class="{ active: liked }"
    :disabled="busy"
    :aria-pressed="String(liked)"
    :aria-label="`Нравится «${recipe.title}», отметок: ${count}`"
    @click="toggle"
  >
    <app-icon name="heart" /> <span class="like-count">{{ count }}</span>
  </button>
</template>

<script setup>
import { toRef } from 'vue'

import AppIcon from '@/components/AppIcon.vue'
import { useLike } from '@/composables/useLike'

const props = defineProps({
  recipe: { type: Object, required: true },
})

const { liked, count, busy, toggle } = useLike(toRef(props, 'recipe'))
</script>
