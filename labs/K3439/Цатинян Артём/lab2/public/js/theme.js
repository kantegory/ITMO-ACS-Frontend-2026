const STORAGE_KEY = "tablely-theme";
const media = matchMedia("(prefers-color-scheme: dark)");
const root = document.documentElement;
const button = document.createElement("button");
button.type = "button";
button.className = "theme-toggle";
document.body.append(button);

function applyTheme(theme) {
  root.dataset.bsTheme = theme;
  const isDark = theme === "dark";
  const label = isDark ? "Включить светлую тему" : "Включить тёмную тему";
  const icon = isDark ? "sun" : "moon";
  button.innerHTML = `<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#${icon}"></use></svg>`;
  button.setAttribute("aria-label", label);
  button.title = label;
}

button.addEventListener("click", () => {
  const next = root.dataset.bsTheme === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
});

media.addEventListener("change", (event) => {
  if (!localStorage.getItem(STORAGE_KEY))
    applyTheme(event.matches ? "dark" : "light");
});
applyTheme(root.dataset.bsTheme);
