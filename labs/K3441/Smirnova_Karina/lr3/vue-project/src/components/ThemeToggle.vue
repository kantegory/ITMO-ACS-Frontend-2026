<script setup>
import { computed } from 'vue'
import spriteUrl from '@/assets/sprite.svg'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()

const buttonLabel = computed(() =>
    isDark.value ? 'Включить светлую тему' : 'Включить тёмную тему',
)

const visibleLabel = computed(() =>
    isDark.value ? 'Светлая тема' : 'Тёмная тема',
)

const iconHref = computed(() =>
    `${spriteUrl}#${isDark.value ? 'sun' : 'moon'}`,
)
</script>

<template>
  <button
      class="theme-toggle"
      type="button"
      :aria-label="buttonLabel"
      :aria-pressed="isDark"
      :title="buttonLabel"
      @click="toggleTheme"
  >
    <svg
        class="theme-toggle__icon"
        aria-hidden="true"
        focusable="false"
    >
      <use :href="iconHref" />
    </svg>

    <span class="theme-toggle__label">
      {{ visibleLabel }}
    </span>
  </button>
</template>

<style scoped>
.theme-toggle {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;

  color: var(--rs-text);
  background: var(--rs-surface);
  border: 1px solid var(--rs-border);
  border-radius: 10px;

  font: inherit;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.theme-toggle:hover {
  color: var(--rs-primary);
  background: var(--rs-primary-soft);
  border-color: var(--rs-primary);
}

.theme-toggle__icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

@media (max-width: 768px) {
  .theme-toggle__label {
    display: none;
  }
}
</style>