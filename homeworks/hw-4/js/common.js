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
          <li><a class="dropdown-item" href="#" id="logout-link"><svg class="icon" aria-hidden="true"><use href="icons/sprite.svg#icon-logout"></use></svg> Выйти</a></li>
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

function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  function render() {
    const isDark = TableBookTheme.current() === "dark";
    const iconId = isDark ? "icon-sun" : "icon-moon";
    btn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="icons/sprite.svg#${iconId}"></use></svg>`;
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
