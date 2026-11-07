// Тема оформления: светлая / тёмная.
// По умолчанию следуем системной настройке (prefers-color-scheme), выбор пользователя хранится в localStorage.
(function () {
  'use strict';
  var KEY = 'jobhub-theme';
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function saved() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; }
  }
  function system() { return mq && mq.matches ? 'dark' : 'light'; }
  function current() { return root.getAttribute('data-theme') || system(); }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme); // компоненты Bootstrap 5.3 тоже переключаются
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1a2e' : '#bfe4ff');
    var btn = document.getElementById('themeToggle');
    if (btn) {
      var dark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
      btn.setAttribute('title', dark ? 'Светлая тема' : 'Тёмная тема');
    }
  }

  // применяем сразу (скрипт подключён в <head>), чтобы не было «вспышки» не той темой
  apply(saved() || system());

  // пока пользователь сам не выбрал тему, следим за системной настройкой
  if (mq) {
    var onChange = function () { if (!saved()) apply(system()); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var host = document.getElementById('navAuth');
    if (host && !document.getElementById('themeToggle')) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'themeToggle';
      btn.className = 'btn btn-outline-secondary theme-toggle me-lg-2 mb-2 mb-lg-0';
      btn.innerHTML = '<i aria-hidden="true" class="bi bi-moon-stars-fill icon-moon"></i>' +
                      '<i aria-hidden="true" class="bi bi-sun-fill icon-sun"></i>';
      host.parentNode.insertBefore(btn, host);
      btn.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        root.classList.add('theme-switching');
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* без хранилища тема просто не запомнится */ }
        setTimeout(function () { root.classList.remove('theme-switching'); }, 400);
      });
      apply(current());
    }
  });
})();
