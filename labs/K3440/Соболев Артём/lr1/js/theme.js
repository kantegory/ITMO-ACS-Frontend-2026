// Переключение светлой/тёмной темы и сохранение выбора пользователя.

const THEME_KEY = "fitnessPlatformTheme";

export function setupTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  document.documentElement.dataset.theme = savedTheme;
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;
  const updateButton = () => {
    const dark = document.documentElement.dataset.theme === "dark";
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute(
      "aria-label",
      dark ? "Включить светлую тему" : "Включить тёмную тему",
    );
    button.querySelector("span").textContent = dark
      ? "Светлая тема"
      : "Тёмная тема";
  };
  updateButton();
  button.addEventListener("click", () => {
    document.documentElement.dataset.theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, document.documentElement.dataset.theme);
    updateButton();
  });
}
