// Управление темой: по умолчанию следует системной теме (prefers-color-scheme),
// но пользователь может переключить тему вручную кнопкой — выбор сохраняется в localStorage
// и с этого момента имеет приоритет над системной темой.
// Подключается синхронно в <head> до отрисовки страницы, чтобы избежать мигания неверной темой.
var TableBookTheme = (function () {
  var STORAGE_KEY = "tablebook_theme";
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function systemTheme() {
    return media.matches ? "dark" : "light";
  }

  function storedTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function apply(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }

  function current() {
    return document.documentElement.getAttribute("data-bs-theme");
  }

  function set(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    apply(theme);
  }

  function toggle() {
    set(current() === "dark" ? "light" : "dark");
  }

  apply(storedTheme() || systemTheme());

  media.addEventListener("change", function (e) {
    if (!storedTheme()) {
      apply(e.matches ? "dark" : "light");
    }
  });

  return { current: current, set: set, toggle: toggle };
})();
