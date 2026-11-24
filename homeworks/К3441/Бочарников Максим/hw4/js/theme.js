/**
 * ДЗ3/ДЗ4 — переключение тем sunset / night + иконки из спрайта
 */

(function () {
  "use strict";

  const STORAGE_KEY = "vice-theme";
  const THEMES = ["sunset", "night"];
  const SPRITE = "img/sprite.svg";

  function preferredTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "night"
      : "sunset";
  }

  function getTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (THEMES.includes(saved)) return saved;
    return preferredTheme();
  }

  function applyTheme(theme) {
    const next = THEMES.includes(theme) ? theme : "sunset";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(STORAGE_KEY, next);
    syncButtons(next);
  }

  function syncButtons(theme) {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      const isNight = theme === "night";
      btn.setAttribute("aria-pressed", String(isNight));
      btn.setAttribute(
        "aria-label",
        isNight ? "Включить светлую тему" : "Включить тёмную тему"
      );
      const label = btn.querySelector("[data-theme-label]");
      if (label) label.textContent = isNight ? "День" : "Ночь";

      const use = btn.querySelector("[data-theme-icon] use");
      if (use) {
        use.setAttribute(
          "href",
          SPRITE + "#" + (isNight ? "icon-sun" : "icon-moon")
        );
      }
    });
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme || getTheme();
    applyTheme(current === "night" ? "sunset" : "night");
  }

  applyTheme(getTheme());

  document.addEventListener("DOMContentLoaded", () => {
    syncButtons(document.documentElement.dataset.theme || getTheme());
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", toggleTheme);
    });
  });
})();
