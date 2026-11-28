(() => {
  const preferenceKey = 'vector-theme';
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function validPreference(value) {
    return value === 'light' || value === 'dark' ? value : 'system';
  }

  function readPreference() {
    try {
      return validPreference(localStorage.getItem(preferenceKey));
    } catch {
      return 'system';
    }
  }

  let preference = readPreference();

  function applyTheme() {
    document.documentElement.dataset.bsTheme = preference === 'system'
      ? (systemDark.matches ? 'dark' : 'light')
      : preference;
  }

  applyTheme();
  systemDark.addEventListener('change', applyTheme);

  document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('theme-choice');
    select.value = preference;
    select.addEventListener('change', () => {
      preference = validPreference(select.value);
      try {
        localStorage.setItem(preferenceKey, preference);
      } catch {
        // При запрете доступа к localStorage тема действует на текущей странице.
      }
      applyTheme();
    });

    window.addEventListener('storage', event => {
      if (event.key !== preferenceKey && event.key !== null) return;
      preference = readPreference();
      select.value = preference;
      applyTheme();
    });
  });
})();
