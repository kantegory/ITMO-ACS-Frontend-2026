/**
 * useTheme.js — светлая, тёмная и системная тема (ДР3).
 *
 * Настройка хранится в localStorage под ключом `recipehub-theme` и принимает
 * значения `system`, `light` или `dark`. Тема применяется атрибутом
 * `data-bs-theme` на <html>: Bootstrap 5.3 читает его для своих color modes,
 * а variables.css — для токенов --rh-*.
 *
 * До загрузки CSS в index.html есть inline-скрипт с той же логикой: он
 * предотвращает вспышку светлой темы. Здесь логика повторяется для
 * переключения во время работы приложения.
 */

import { computed, ref } from 'vue';
import { announce } from './useLiveRegion';

export const THEME_STORAGE_KEY = 'recipehub-theme';

const PREFERENCES = ['system', 'light', 'dark'];

const THEME_META = {
  light: { label: 'Светлая', icon: 'sun' },
  dark: { label: 'Тёмная', icon: 'moon' },
  system: { label: 'Системная', icon: 'monitor' },
};

const mediaQuery = window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null;

/** Прочитать настройку из localStorage (при ошибке — «как в системе»). */
function readPreference() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return PREFERENCES.includes(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/** Сохранить настройку. Ошибки приватного режима не должны ломать UI. */
function savePreference(preference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* localStorage может быть недоступен — тема продолжит работать в памяти. */
  }
}

const preference = ref(readPreference());

/** Какая тема реально будет применена с учётом системной настройки. */
export const resolvedTheme = computed(() => {
  if (preference.value === 'light' || preference.value === 'dark') {
    return preference.value;
  }
  return mediaQuery?.matches ? 'dark' : 'light';
});

/** Подпись и иконка для текущего выбора. */
export const themeMeta = computed(() => THEME_META[preference.value]);

/** Применить тему к документу. */
function applyTheme() {
  document.documentElement.setAttribute('data-bs-theme', resolvedTheme.value);
}

/**
 * Изменить настройку темы.
 *
 * @param {'system'|'light'|'dark'} next
 * @param {{ persist?: boolean, notify?: boolean }} options
 */
export function setThemePreference(next, { persist = true, notify = true } = {}) {
  preference.value = PREFERENCES.includes(next) ? next : 'system';
  if (persist) savePreference(preference.value);
  applyTheme();

  if (!notify) return;

  if (preference.value === 'system') {
    const resolvedLabel = resolvedTheme.value === 'dark' ? 'тёмная' : 'светлая';
    announce(`Тема оформления: как в системе (сейчас ${resolvedLabel})`);
    return;
  }

  announce(
    `Тема оформления: ${resolvedTheme.value === 'dark' ? 'тёмная' : 'светлая'}`,
  );
}

let initialized = false;

/** Инициализировать тему и подписки на системные изменения. */
export function initTheme() {
  applyTheme();

  if (initialized) return;
  initialized = true;

  // Если выбрано «как в системе», реагируем на смену темы ОС.
  if (mediaQuery) {
    const onSystemThemeChange = () => {
      if (preference.value === 'system') applyTheme();
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onSystemThemeChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(onSystemThemeChange);
    }
  }

  // Синхронизация между вкладками.
  window.addEventListener('storage', (event) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    preference.value = readPreference();
    applyTheme();
  });
}

/** Публичный интерфейс для компонентов. */
export function useTheme() {
  return {
    preference,
    resolvedTheme,
    themeMeta,
    setThemePreference,
  };
}
