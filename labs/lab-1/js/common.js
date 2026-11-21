// Общая логика шапки сайта: показывает "Вход/Регистрация" или имя пользователя

// Форматирует дату в стандартный для РФ вид ДД.ММ.ГГГГ
function formatDate(dateStr) {
  if (!dateStr) return "";
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}.${month}.${year}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// Форматирует дату и время в вид ДД.ММ.ГГГГ, ЧЧ:ММ
function formatDateTime(dateStr, timeStr) {
  const datePart = formatDate(dateStr);
  if (!timeStr) return datePart;
  return `${datePart}, ${timeStr}`;
}

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
