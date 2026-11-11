<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: { type: Object, default: null },
  size: { type: String, default: '' }
})

const initials = computed(() =>
  (props.user?.name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
)

const color = computed(() =>
  /^#[0-9a-f]{6}$/i.test(props.user?.avatarColor ?? '') ? props.user.avatarColor : '#b84a24'
)
</script>

<template>
  <!-- имя всегда написано рядом, поэтому инициалы скрыты от скринридера -->
  <span
    class="avatar"
    :class="size && `avatar--${size}`"
    :style="{ '--avatar-bg': color }"
    aria-hidden="true"
  >{{ initials }}</span>
</template>
