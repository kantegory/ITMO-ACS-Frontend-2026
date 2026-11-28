<template>
  <svg
    class="icon"
    :class="className"
    aria-hidden="true"
    focusable="false"
  >
    <use :href="href" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { iconHref } from '@/composables/useIcons'

const props = defineProps({
  name: { type: String, required: true },
  className: { type: String, default: '' },
})

const href = computed(() => iconHref(props.name))
</script>
