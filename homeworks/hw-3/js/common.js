// Общая логика шапки сайта: показывает "Вход/Регистрация" или имя пользователя
function renderAuthNav() {
  const slot = document.getElementById("nav-auth-slot");
  if (!slot) return;
  const user = currentUser();
  if (user) {
    slot.innerHTML = `
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Меню пользователя ${user.name}">
          ${user.name}
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="profile.html">Личный кабинет</a></li>
          <li><a class="dropdown-item" href="#" id="logout-link">Выйти</a></li>
        </ul>
      </li>`;
    document.getElementById("logout-link").addEventListener("click", (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = "index.html";
    });
  } else {
    slot.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="login.html">Вход</a></li>
      <li class="nav-item"><a class="btn btn-light btn-sm ms-2" href="register.html">Регистрация</a></li>`;
  }
}

const ICON_SUN = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    <path d="M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.414a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
  </svg>`;

const ICON_MOON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.75.75 0 0 1 .81.316.733.733 0 0 1-.145.95A9.5 9.5 0 0 1 8 16c-5.27 0-9.544-4.253-9.544-9.5a9.5 9.5 0 0 1 5.3-8.546.75.75 0 0 1 1.244.324z" transform="translate(1.5)"/>
  </svg>`;

function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  function render() {
    const isDark = TableBookTheme.current() === "dark";
    btn.innerHTML = isDark ? ICON_SUN : ICON_MOON;
    btn.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
    btn.setAttribute("aria-pressed", String(isDark));
  }

  btn.addEventListener("click", () => {
    TableBookTheme.toggle();
    render();
  });

  render();
}

document.addEventListener("DOMContentLoaded", () => {
  renderAuthNav();
  setupThemeToggle();
});
