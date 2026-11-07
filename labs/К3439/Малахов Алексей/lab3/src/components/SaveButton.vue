<template>
  <button
    type="button"
    class="btn btn-outline-secondary btn-save"
    :class="{ active: saved }"
    :disabled="isPending(recipeId)"
    :aria-pressed="String(saved)"
    @click="toggle(recipeId)"
  >
    <app-icon name="bookmark" /> <span>{{ saved ? 'Сохранён' : 'Сохранить' }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

import AppIcon from '@/components/AppIcon.vue'
import { useSaved } from '@/composables/useSaved'

const props = defineProps({
  recipeId: { type: Number, required: true },
})

const { isSaved, isPending, toggle } = useSaved()
const saved = computed(() => isSaved(props.recipeId))
</script>
