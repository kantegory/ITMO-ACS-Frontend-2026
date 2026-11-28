// Общие функции для всех страниц

const SHAPE_NAMES = {
  RECTANGLE: "Прямоугольник",
  SQUARE: "Квадрат",
  CIRCLE: "Круг",
  ELLIPSE: "Овал",
  RUNNER: "Дорожка",
  CUSTOM: "Нестандартная",
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatPrice(value) {
  return value.toLocaleString("ru-RU") + " ₽";
}

// ---------- сессия (токен и пользователь хранятся в localStorage) ----------
function getToken() {
  return localStorage.getItem("carpetshop_token");
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("carpetshop_user") || "null");
}

function setCurrentUser(user) {
  localStorage.setItem("carpetshop_user", JSON.stringify(user));
}

function saveSession(data) {
  localStorage.setItem("carpetshop_token", data.token);
  setCurrentUser(data.user);
}

function clearSession() {
  localStorage.removeItem("carpetshop_token");
  localStorage.removeItem("carpetshop_user");
}

async function logout() {
  try {
    await logoutRequest();
  } catch (err) {
    // если сервер недоступен или токен уже недействителен — всё равно выходим
  }
  clearSession();
  window.location.href = "index.html";
}

// ---------- меню ----------
function renderNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  let links = '<a class="nav-link" href="index.html">Каталог</a>';
  if (getToken()) {
    links += '<a class="nav-link" href="profile.html">Личный кабинет</a>';
    links += '<a class="nav-link" href="#" id="logout-link">Выйти</a>';
  } else {
    links += '<a class="nav-link" href="login.html">Вход</a>';
    links += '<a class="nav-link" href="register.html">Регистрация</a>';
  }

  navbar.innerHTML =
    '<nav class="navbar navbar-expand-md navbar-dark bg-dark">' +
    '<div class="container">' +
    '<a class="navbar-brand" href="index.html">CarpetShop</a>' +
    '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">' +
    '<span class="navbar-toggler-icon"></span></button>' +
    '<div class="collapse navbar-collapse" id="menu"><div class="navbar-nav ms-auto">' +
    links +
    "</div></div></div></nav>";

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

// показать сообщение в блоке с id="message"
function showMessage(text, type) {
  const box = document.getElementById("message");
  if (!box) return;
  box.className = "alert alert-" + (type || "danger");
  box.textContent = text;
}

renderNavbar();
