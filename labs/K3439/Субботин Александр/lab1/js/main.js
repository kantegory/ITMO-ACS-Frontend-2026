// Общий скрипт для всех страниц «Столика»

const USER_KEY = 'stolik-user';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

// Переключаем шапку между «гостем» и «авторизованным пользователем».
// В ЛР1 факт входа просто хранится в localStorage, без сервера.
function renderAuthState() {
  const user = getUser();

  document.querySelectorAll('[data-guest]').forEach((el) => {
    el.classList.toggle('d-none', Boolean(user));
  });
  document.querySelectorAll('[data-auth]').forEach((el) => {
    el.classList.toggle('d-none', !user);
  });

  if (!user) return;

  document.querySelectorAll('[data-user-name]').forEach((el) => {
    el.textContent = user.name;
  });
  document.querySelectorAll('[data-user-initials]').forEach((el) => {
    el.textContent = getInitials(user.name);
  });
  document.querySelectorAll('[data-user-email]').forEach((el) => {
    el.textContent = user.email;
  });
  document.querySelectorAll('[data-user-phone]').forEach((el) => {
    el.textContent = user.phone || 'Телефон не указан';
  });
}

function initLogout() {
  document.querySelectorAll('[data-logout]').forEach((btn) => {
    btn.addEventListener('click', () => {
      localStorage.removeItem(USER_KEY);
      window.location.href = 'index.html';
    });
  });
}

// Всплывающее уведомление на базе Bootstrap Toast
function showToast(message, variant = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.append(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${variant} border-0`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body"></div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Закрыть"></button>
    </div>`;
  toast.querySelector('.toast-body').textContent = message;
  container.append(toast);

  const instance = bootstrap.Toast.getOrCreateInstance(toast, { delay: 4000 });
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
  instance.show();
}

// Bootstrap-валидация: подсвечиваем поля и вызываем handler только для валидной формы
function onValidSubmit(form, handler) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.classList.add('was-validated');

    if (!form.checkValidity()) {
      form.querySelector(':invalid')?.focus();
      return;
    }
    handler(new FormData(form), form);
  });
}

// Кнопка «глаз» рядом с полем пароля
function initPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
    const input = document.querySelector(btn.dataset.togglePassword);
    btn.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(isHidden));
      btn.setAttribute('aria-label', isHidden ? 'Скрыть пароль' : 'Показать пароль');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderAuthState();
  initLogout();
  initPasswordToggles();

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
