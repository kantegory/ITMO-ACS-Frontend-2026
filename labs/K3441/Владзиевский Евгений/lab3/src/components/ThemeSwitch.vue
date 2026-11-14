<script setup>
import AppIcon from './AppIcon.vue';
import { useTheme } from '../composables/useTheme.js';
import { useToasts } from '../composables/useToasts.js';

const { preference, current, themes, setPreference } = useTheme();
const { toast } = useToasts();

function choose(theme) {
  setPreference(theme.value);
  toast(`Оформление: ${theme.label.toLowerCase()}`);
}
</script>

<template>
  <div class="dropdown theme-switch">
    <button
      class="btn btn-outline-secondary btn-sm"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      :aria-label="`Оформление: ${current.label}`"
    >
      <AppIcon :name="current.icon" />
      <span class="d-none d-xl-inline">{{ current.label }}</span>
    </button>

    <ul class="dropdown-menu dropdown-menu-end">
      <li v-for="theme in themes" :key="theme.value">
        <button
          class="dropdown-item"
          type="button"
          :class="{ active: theme.value === preference }"
          :aria-current="theme.value === preference ? 'true' : undefined"
          @click="choose(theme)"
        >
          <AppIcon :name="theme.icon" />{{ theme.label }}
          <AppIcon name="check2" class="tick" />
        </button>
      </li>
    </ul>
  </div>
</template>
