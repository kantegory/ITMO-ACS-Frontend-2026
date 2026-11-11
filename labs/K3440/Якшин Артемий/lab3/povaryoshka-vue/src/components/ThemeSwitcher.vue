<script setup>
import { computed } from 'vue'

import BaseIcon from '@/components/BaseIcon.vue'
import { THEME_OPTIONS, useTheme } from '@/composables/useTheme'

const { theme, effectiveTheme, setTheme } = useTheme()

const label = computed(() => {
  const current = THEME_OPTIONS.find((option) => option.value === theme.value)
  return `Тема оформления: ${current.label.toLowerCase()}`
})
</script>

<template>
  <div class="dropdown theme-switcher me-lg-2 mt-3 mt-lg-0">
    <button
      class="btn btn-soft"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      :aria-label="label"
      :title="label"
    >
      <BaseIcon :name="effectiveTheme === 'dark' ? 'moon' : 'sun'" />
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
      <li v-for="option in THEME_OPTIONS" :key="option.value">
        <button
          class="dropdown-item"
          :class="{ active: theme === option.value }"
          type="button"
          :aria-pressed="theme === option.value"
          @click="setTheme(option.value)"
        >
          <BaseIcon :name="option.icon" /> {{ option.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
