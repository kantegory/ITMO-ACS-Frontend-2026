// Применяет сохранённую тему до отрисовки страницы, чтобы избежать вспышки светлого фона.
(() => {
  const STORAGE_KEY = 'rentSpaceTheme';
  const THEMES = ['light', 'dark'];

  function readSavedTheme() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      return THEMES.includes(savedTheme) ? savedTheme : 'light';
    } catch {
      return 'light';
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Тема продолжит работать в текущей вкладке, даже если хранилище недоступно.
    }
  }

  function updateThemeToggles(theme) {
    const isDark = theme === 'dark';
    const nextThemeName = isDark ? 'светлую' : 'тёмную';
    const buttonText = isDark ? 'Светлая тема' : 'Тёмная тема';
    const iconHref = `assets/sprite.svg#${isDark ? 'sun' : 'moon'}`;

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(isDark));
      button.setAttribute('aria-label', `Включить ${nextThemeName} тему`);
      button.title = `Включить ${nextThemeName} тему`;

      const label = button.querySelector('[data-theme-label]');
      const iconElement = button.querySelector('[data-theme-icon]');
      if (label) label.textContent = buttonText;
      if (iconElement) iconElement.querySelector('use')?.setAttribute('href', iconHref);
    });
  }

  function applyTheme(theme, shouldSave = false) {
    const nextTheme = THEMES.includes(theme) ? theme : 'light';
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    updateThemeToggles(nextTheme);
    if (shouldSave) saveTheme(nextTheme);
  }

  applyTheme(readSavedTheme());

  document.addEventListener('DOMContentLoaded', () => {
    updateThemeToggles(document.documentElement.dataset.theme);

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme;
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
      });
    });
  });
})();
