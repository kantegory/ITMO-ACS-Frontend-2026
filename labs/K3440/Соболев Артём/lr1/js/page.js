// Общая навигация и доступность; подключает тему и состояние авторизации.
import { readStoredUser, getToken } from "./session.js";
import { setupTheme } from "./theme.js";
import { setupLogout, setupAccountGuard } from "./auth.js";

// Общие элементы страниц: навигация, тема и доступность.
export function setupPageBasics() {
  const user = readStoredUser();
  document.body.classList.toggle(
    "is-authenticated",
    Boolean(user && getToken()),
  );
  const main = document.querySelector("main");
  if (main && !document.querySelector(".skip-link")) {
    const skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#main-content";
    skip.textContent = "Перейти к содержимому";
    main.id = main.id || "main-content";
    document.body.prepend(skip);
  }
  document.querySelectorAll(".site-nav .navbar-toggler").forEach((button) => {
    if (!button.hasAttribute("aria-label"))
      button.setAttribute("aria-label", "Открыть меню");
    if (!button.hasAttribute("aria-controls"))
      button.setAttribute("aria-controls", "nav");
    if (!button.hasAttribute("aria-expanded"))
      button.setAttribute("aria-expanded", "false");
  });
  const navContainer = document.querySelector(".site-nav .container");
  if (navContainer && !navContainer.querySelector("[data-theme-toggle]")) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.dataset.themeToggle = "";
    button.innerHTML =
      '<svg aria-hidden="true" focusable="false"><use href="assets/icons.svg#theme"></use></svg><span>Тема</span>';
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Включить тёмную тему");
    navContainer.append(button);
  }
  document
    .querySelectorAll(".site-nav a.nav-link.active")
    .forEach((link) => link.setAttribute("aria-current", "page"));
  setupTheme();
  setupLogout();
  setupAccountGuard();
}
