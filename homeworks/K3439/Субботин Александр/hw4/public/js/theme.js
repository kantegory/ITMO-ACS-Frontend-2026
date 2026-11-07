// Тема оформления. По умолчанию — «как в системе»: dark.css подключён с media="(prefers-color-scheme: dark)".
// Переключатель в шапке меняет этот media: 'all' — тёмная тема всегда, 'not all' — никогда.
// Скрипт стоит в <head> без defer: тема применяется до первой отрисовки, и страница не «мигает» светлой.

const THEME_KEY = 'theme';
const SYSTEM_DARK = '(prefers-color-scheme: dark)';
const THEME_MEDIA = { auto: SYSTEM_DARK, dark: 'all', light: 'not all' };
const THEME_LABELS = { auto: 'как в системе', light: 'светлая', dark: 'тёмная' };
const systemDarkQuery = window.matchMedia(SYSTEM_DARK);

function getStoredTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return theme in THEME_MEDIA ? theme : 'auto';
  } catch {
    return 'auto';
  }
}

function applyTheme(choice) {
  document.querySelector('#darkTheme').media = THEME_MEDIA[choice];
  const isDark = choice === 'dark' || (choice === 'auto' && systemDarkQuery.matches);
  // По data-bs-theme Bootstrap перекрашивает свои компоненты: крестики модалок, стрелки селектов, меню
  document.documentElement.dataset.bsTheme = isDark ? 'dark' : 'light';
}

// Состояние переключателя: какая кнопка нажата, какая иконка видна и что прочитает скринридер
function updateThemeSwitcher(choice) {
  document.querySelectorAll('[data-theme-value]').forEach((button) => {
    const active = button.dataset.themeValue === choice;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-theme-icon]').forEach((icon) => {
    icon.classList.toggle('d-none', icon.dataset.themeIcon !== choice);
  });
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-label', `Тема оформления: ${THEME_LABELS[choice]}`);
  });
}

function setTheme(choice) {
  try {
    if (choice === 'auto') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // без localStorage тема просто не запомнится
  }
  applyTheme(choice);
  updateThemeSwitcher(choice);
}

applyTheme(getStoredTheme());

// Тема в системе поменялась (например, вечером) — подстраиваемся, если выбрано «как в системе»
systemDarkQuery.addEventListener('change', () => {
  if (getStoredTheme() === 'auto') applyTheme('auto');
});

// Тему переключили в другой вкладке
window.addEventListener('storage', (event) => {
  if (event.key !== THEME_KEY && event.key !== null) return;
  applyTheme(getStoredTheme());
  updateThemeSwitcher(getStoredTheme());
});

document.addEventListener('DOMContentLoaded', () => {
  updateThemeSwitcher(getStoredTheme());
  document.querySelectorAll('[data-theme-value]').forEach((button) => {
    button.addEventListener('click', () => setTheme(button.dataset.themeValue));
  });
});
