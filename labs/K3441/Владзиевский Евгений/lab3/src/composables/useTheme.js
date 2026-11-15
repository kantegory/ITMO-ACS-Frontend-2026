// Тема из ДЗ3: «как в системе», светлая, тёмная.
// Первое применение делает скрипт в index.html — до отрисовки страницы.

import { computed, ref } from 'vue';

const THEME_KEY = 'klyuchi:theme';
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

export const THEMES = [
  { value: 'auto', label: 'Как в системе', icon: 'circle-half' },
  { value: 'light', label: 'Светлая', icon: 'sun' },
  { value: 'dark', label: 'Тёмная', icon: 'moon-stars' }
];

function readPreference() {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY));
    return THEMES.some((t) => t.value === saved) ? saved : 'auto';
  } catch {
    return 'auto';
  }
}

const preference = ref(readPreference());

function apply() {
  const dark = preference.value === 'dark' || (preference.value === 'auto' && darkQuery.matches);
  const theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;     // наши переменные
  document.documentElement.dataset.bsTheme = theme;   // компоненты Bootstrap
}

// Пока выбран режим «как в системе», следим за настройкой ОС
darkQuery.addEventListener('change', () => {
  if (preference.value === 'auto') apply();
});

export function useTheme() {
  return {
    preference,
    current: computed(() => THEMES.find((t) => t.value === preference.value)),
    themes: THEMES,
    setPreference(value) {
      preference.value = value;
      localStorage.setItem(THEME_KEY, JSON.stringify(value));
      apply();
    }
  };
}
