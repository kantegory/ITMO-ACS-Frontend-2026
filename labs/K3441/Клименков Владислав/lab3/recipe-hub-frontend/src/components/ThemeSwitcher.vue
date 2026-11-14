<script setup>
/**
 * ThemeSwitcher.vue — переключатель темы оформления (ДР3).
 */

import BaseIcon from './BaseIcon.vue';
import { useTheme } from '@/composables/useTheme';

const { preference, themeMeta, setThemePreference } = useTheme();

const options = [
  { value: 'system', label: 'Как в системе', icon: 'monitor' },
  { value: 'light', label: 'Светлая', icon: 'sun' },
  { value: 'dark', label: 'Тёмная', icon: 'moon' },
];
</script>

<template>
  <div class="dropdown">
    <button
      class="btn btn-outline-secondary dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <BaseIcon :name="themeMeta.icon" class="rh-theme-icon me-1" />
      <span class="visually-hidden">Тема оформления:</span>
      <span>{{ themeMeta.label }}</span>
    </button>

    <ul
      class="dropdown-menu dropdown-menu-end rh-theme-menu"
      aria-label="Выбор темы оформления"
    >
      <li v-for="option in options" :key="option.value">
        <button
          class="dropdown-item d-flex align-items-center gap-2"
          type="button"
          :aria-pressed="preference === option.value"
          @click="setThemePreference(option.value)"
        >
          <BaseIcon :name="option.icon" />
          <span>{{ option.label }}</span>
          <BaseIcon
            name="check"
            class="ms-auto"
            :class="{ invisible: preference !== option.value }"
          />
        </button>
      </li>
    </ul>
  </div>
</template>
