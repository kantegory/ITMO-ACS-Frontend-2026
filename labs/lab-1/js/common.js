// Общая логика шапки сайта: показывает "Вход/Регистрация" или имя пользователя
function currentUser() {
  const raw = localStorage.getItem("tablebook_user");
  return raw ? JSON.parse(raw) : null;
}

function renderAuthNav() {
  const slot = document.getElementById("nav-auth-slot");
  if (!slot) return;
  const user = currentUser();
  if (user) {
    slot.innerHTML = `
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle text-white" href="#" data-bs-toggle="dropdown">
          ${user.name}
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="profile.html">Личный кабинет</a></li>
          <li><a class="dropdown-item" href="#" id="logout-link">Выйти</a></li>
        </ul>
      </li>`;
    document.getElementById("logout-link").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("tablebook_user");
      window.location.href = "index.html";
    });
  } else {
    slot.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="login.html">Вход</a></li>
      <li class="nav-item"><a class="btn btn-light btn-sm ms-2" href="register.html">Регистрация</a></li>`;
  }
}

document.addEventListener("DOMContentLoaded", renderAuthNav);
