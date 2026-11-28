(() => {
  const storageKey = 'kachalochka:theme';
  const system = matchMedia('(prefers-color-scheme: dark)');
  const choices = ['auto', 'light', 'dark'];
  let preference = 'auto';

  try {
    const stored = localStorage.getItem(storageKey);
    if (choices.includes(stored)) preference = stored;
  } catch {
    // The system setting still works when browser storage is unavailable.
  }

  function applyTheme() {
    const theme = preference === 'auto' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.bsTheme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#171c17' : '#f8f9f5';
  }

  applyTheme();
  system.addEventListener('change', applyTheme);
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = choices.includes(event.newValue) ? event.newValue : 'auto';
    const control = document.querySelector('#theme-select');
    if (control) control.value = preference;
    applyTheme();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const control = document.querySelector('#theme-select');
    control.value = preference;
    control.addEventListener('change', () => {
      preference = control.value;
      applyTheme();
      try {
        localStorage.setItem(storageKey, preference);
      } catch {
        // Keep the selected theme for the current page.
      }
    });
  });
})();
