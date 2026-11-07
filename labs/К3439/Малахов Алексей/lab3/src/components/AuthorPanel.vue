<template>
  <div class="panel d-flex align-items-center gap-3 py-3">
    <span class="avatar" aria-hidden="true">{{ initials(name) }}</span>
    <div class="flex-grow-1">
      <router-link class="fw-medium text-reset" :to="link">{{ name }}</router-link>
      <div class="text-muted small">{{ subtitle }}</div>
    </div>
    <slot />
  </div>
</template>

<script setup>
import { initials } from '@/utils/format'

defineProps({
  name: { type: String, required: true },
  link: { type: Object, required: true },
  subtitle: { type: String, default: '' },
})
</script>
