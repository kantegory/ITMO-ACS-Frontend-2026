<script setup>
import { computed } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { THEMES, useTheme } from '@/composables/useTheme'

const { theme, setTheme } = useTheme()
const current = computed(() => THEMES.find((item) => item.value === theme.value))
</script>

<template>
  <div class="dropdown theme-switcher">
    <button
      class="btn theme-toggle dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      :aria-label="`Тема оформления: ${current.title}`"
    >
      <AppIcon :name="current.icon" />
      <span class="d-lg-none" aria-hidden="true">Тема</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
      <li v-for="item in THEMES" :key="item.value">
        <button
          class="dropdown-item"
          :class="{ active: item.value === theme }"
          type="button"
          :aria-pressed="String(item.value === theme)"
          @click="setTheme(item.value)"
        >
          <AppIcon :name="item.icon" />{{ item.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
