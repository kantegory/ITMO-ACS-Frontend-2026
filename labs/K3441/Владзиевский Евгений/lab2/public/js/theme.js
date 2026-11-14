// Переключатель темы: авто (как в системе), светлая, тёмная.
// Выбор лежит в localStorage, сама тема — в атрибутах <html>.
// Первое применение делает маленький скрипт в <head>, иначе при загрузке мигает светлый фон.

const THEME_KEY = 'klyuchi:theme';
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

// icon — имя символа в общем спрайте img/sprite.svg
const THEMES = [
  { value: 'auto', label: 'Как в системе', icon: 'circle-half' },
  { value: 'light', label: 'Светлая', icon: 'sun' },
  { value: 'dark', label: 'Тёмная', icon: 'moon-stars' }
];

function themePreference() {
  const saved = storage.get(THEME_KEY, 'auto');
  return THEMES.some(t => t.value === saved) ? saved : 'auto';
}

// Из «что выбрал пользователь» получаем «что показывать сейчас»
function resolveTheme(preference) {
  if (preference === 'auto') return darkQuery.matches ? 'dark' : 'light';
  return preference;
}

function applyTheme(preference) {
  const theme = resolveTheme(preference);
  const root = document.documentElement;
  root.dataset.theme = theme;        // наши переменные
  root.dataset.bsTheme = theme;      // компоненты Bootstrap
}

function renderThemeSwitch() {
  const slot = document.querySelector('[data-theme-slot]');
  if (!slot) return;
  const preference = themePreference();
  const current = THEMES.find(t => t.value === preference);

  slot.innerHTML = `
    <div class="dropdown theme-switch">
      <button class="btn btn-outline-secondary btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false"
              aria-label="Оформление: ${current.label}">
        <svg class="icon" aria-hidden="true"><use href="img/sprite.svg#${current.icon}"></use></svg>
        <span class="d-none d-xl-inline">${current.label}</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        ${THEMES.map(t => `
          <li>
            <button class="dropdown-item ${t.value === preference ? 'active' : ''}" type="button"
                    data-theme-value="${t.value}" ${t.value === preference ? 'aria-current="true"' : ''}>
              <svg class="icon" aria-hidden="true"><use href="img/sprite.svg#${t.icon}"></use></svg>${t.label}
              <svg class="icon tick" aria-hidden="true"><use href="img/sprite.svg#check2"></use></svg>
            </button>
          </li>`).join('')}
      </ul>
    </div>`;

  slot.querySelectorAll('[data-theme-value]').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.themeValue;
      storage.set(THEME_KEY, value);
      applyTheme(value);
      renderThemeSwitch();
      showToast(`Оформление: ${THEMES.find(t => t.value === value).label.toLowerCase()}`);
    });
  });
}

// Пока выбран режим «как в системе», следим за переключением темы в ОС
darkQuery.addEventListener('change', () => {
  if (themePreference() === 'auto') applyTheme('auto');
});

document.addEventListener('DOMContentLoaded', renderThemeSwitch);
