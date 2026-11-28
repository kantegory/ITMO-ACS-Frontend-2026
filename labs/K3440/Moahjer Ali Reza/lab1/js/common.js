// Общие функции для всех страниц

const SHAPE_NAMES = {
  RECTANGLE: "Прямоугольник",
  SQUARE: "Квадрат",
  CIRCLE: "Круг",
  ELLIPSE: "Овал",
  RUNNER: "Дорожка",
  CUSTOM: "Нестандартная",
};

const STATUS_NAMES = {
  PENDING: "Ожидает",
  PAID: "Оплачен",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
  CANCELED: "Отменён",
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatPrice(value) {
  return value.toLocaleString("ru-RU") + " ₽";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("ru-RU");
}

function getCarpetById(id) {
  return CARPETS.find((c) => c.id === Number(id));
}

function getCategoryTitle(id) {
  const category = CATEGORIES.find((c) => c.id === id);
  return category ? category.title : "";
}

// ---------- текущий пользователь ----------
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("carpetshop_user") || "null");
}

function setCurrentUser(user) {
  localStorage.setItem("carpetshop_user", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("carpetshop_user");
  window.location.href = "index.html";
}

// ---------- меню ----------
function renderNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  let links = '<a class="nav-link" href="index.html">Каталог</a>';
  if (getCurrentUser()) {
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
