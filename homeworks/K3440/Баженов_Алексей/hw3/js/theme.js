(function () {
  const KEY = 'theme';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const saved = () => {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  };
  const save = (theme) => {
    try { localStorage.setItem(KEY, theme); } catch (e) { /* хранилище недоступно — не страшно */ }
  };
  const systemTheme = () => (media.matches ? 'dark' : 'light');

  // data-theme — для наших переменных, data-bs-theme — для компонентов Bootstrap 5.3
  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme);
    const button = document.getElementById('themeToggle');
    if (button) button.setAttribute('aria-pressed', String(theme === 'dark'));
  };

  apply(saved() || systemTheme());

  media.addEventListener('change', () => {
    if (!saved()) apply(systemTheme());
  });

  document.addEventListener('DOMContentLoaded', () => {
    const list = document.querySelector('#nav .navbar-nav');
    if (!list) return;

    const item = document.createElement('li');
    item.className = 'nav-item d-flex align-items-center ms-sm-2 mt-2 mt-sm-0';
    item.innerHTML = '<button type="button" id="themeToggle" class="btn btn-outline-secondary btn-sm">Тёмная тема</button>';
    list.appendChild(item);

    const button = item.firstElementChild;
    button.setAttribute('aria-pressed', String(root.getAttribute('data-theme') === 'dark'));
    button.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      save(next);
      apply(next);
    });
  });
})();
