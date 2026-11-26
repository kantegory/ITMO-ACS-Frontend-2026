export const themeKey = 'stolik:theme';

export function themePreference() {
  const preferred = localStorage.getItem(themeKey);
  return ['light', 'dark'].includes(preferred) ? preferred : null;
}

export function applyTheme(preference = themePreference()) {
  const dark = preference ? preference === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.bsTheme = dark ? 'dark' : 'light';
  return dark;
}

export function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(themeKey, next);
  return applyTheme(next);
}

export function mountThemeButton() {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('./theme.css', import.meta.url).href;
  document.head.append(style);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-outline-primary theme-button';
  button.textContent = 'Тёмная тема';
  button.setAttribute('aria-pressed', String(applyTheme()));
  button.addEventListener('click', () => button.setAttribute('aria-pressed', String(toggleTheme())));
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    button.setAttribute('aria-pressed', String(applyTheme()));
  });
  document.querySelector('.header-actions').prepend(button);
}
