const themeStorageKey = "finderjobs-hw4-theme";
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
const savedTheme = localStorage.getItem(themeStorageKey);
const initialTheme = savedTheme === "dark" || savedTheme === "light"
    ? savedTheme
    : systemTheme.matches ? "dark" : "light";

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.bsTheme = theme;
}

applyTheme(initialTheme);

document.addEventListener("DOMContentLoaded", () => {
    const navbarContainer = document.querySelector(".navbar .container");

    if (!navbarContainer || document.querySelector(".theme-toggle")) {
        return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-outline-light theme-toggle ms-2";
    button.setAttribute("aria-label", "Переключить тему");

    const updateButton = () => {
        const isDark = document.documentElement.dataset.theme === "dark";
        button.innerHTML = `<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/sprite.svg#${isDark ? "sun" : "moon"}"></use></svg>`;
        button.setAttribute("aria-pressed", String(isDark));
        button.title = isDark ? "Включить светлую тему" : "Включить тёмную тему";
    };

    button.addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === "dark"
            ? "light"
            : "dark";

        applyTheme(nextTheme);
        localStorage.setItem(themeStorageKey, nextTheme);
        updateButton();
    });

    navbarContainer.append(button);
    updateButton();

    systemTheme.addEventListener("change", (event) => {
        if (!localStorage.getItem(themeStorageKey)) {
            applyTheme(event.matches ? "dark" : "light");
            updateButton();
        }
    });
});
