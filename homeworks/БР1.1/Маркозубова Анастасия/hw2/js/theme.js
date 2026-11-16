const savedTheme = localStorage.getItem("finderjobs-theme") || "light";
document.documentElement.dataset.theme = savedTheme;

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
        button.textContent = isDark ? "☀" : "☾";
        button.setAttribute("aria-pressed", String(isDark));
        button.title = isDark ? "Включить светлую тему" : "Включить тёмную тему";
    };

    button.addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === "dark"
            ? "light"
            : "dark";

        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem("finderjobs-theme", nextTheme);
        updateButton();
    });

    navbarContainer.append(button);
    updateButton();
});
