<script setup>
import { computed } from "vue";
import { useTheme } from "../composables/useTheme";
import SvgIcon from "./SvgIcon.vue";
const { theme, toggleTheme } = useTheme();
const label = computed(() =>
  theme.value === "dark" ? "Включить светлую тему" : "Включить тёмную тему",
);
</script>
<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="label"
    :title="label"
    @click="toggleTheme"
  >
    <SvgIcon :name="theme === 'dark' ? 'sun' : 'moon'" />
  </button>
</template>
