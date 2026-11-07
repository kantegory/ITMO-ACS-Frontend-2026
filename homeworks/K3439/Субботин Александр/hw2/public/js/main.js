// Общий скрипт для всех страниц «Столика». Подключается после api.js.

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

// Переключаем шапку между «гостем» и вошедшим пользователем по данным из localStorage
function renderAuthState() {
  const user = isLoggedIn() ? getUser() : null;

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

// Для закрытых страниц: без токена отправляем на вход и возвращаем обратно после него
function requireAuth() {
  if (isLoggedIn()) return true;
  redirectToLogin();
  return false;
}

function initLogout() {
  document.querySelectorAll('[data-logout]').forEach((btn) => {
    btn.addEventListener('click', () => {
      clearAuth();
      window.location.href = 'index.html';
    });
  });
}

// Контейнер для тостов — live-область. Он создаётся заранее: скринридер объявляет только
// изменения внутри уже существующей области, а не элемент, вставленный вместе с текстом
function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-atomic', 'false');
  document.body.append(container);
  return container;
}

// Всплывающее уведомление на базе Bootstrap Toast. Ошибка не прячется сама — её закрывают кнопкой
function showToast(message, variant = 'success') {
  const container = document.querySelector('.toast-container') ?? createToastContainer();
  const isError = variant === 'danger';

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${variant} border-0`;
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body"></div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Закрыть"></button>
    </div>`;
  toast.querySelector('.toast-body').textContent = message;
  container.append(toast);

  const instance = bootstrap.Toast.getOrCreateInstance(toast, { delay: 6000, autohide: !isError });
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
  instance.show();
}

// Bootstrap подсвечивает ошибки только цветом. Для скринридера помечаем поле aria-invalid
// и, пока ошибка видна, добавляем её текст (id из aria-errormessage) в aria-describedby
function syncValidity(form) {
  form.querySelectorAll('[aria-errormessage]').forEach((field) => {
    const controls = field.matches('fieldset') ? [...field.querySelectorAll('input')] : [field];
    const invalid = controls.some((control) => !control.validity.valid);
    const errorId = field.getAttribute('aria-errormessage');
    const describedBy = (field.getAttribute('aria-describedby') ?? '').split(' ').filter((id) => id && id !== errorId);
    if (invalid) describedBy.push(errorId);

    field.setAttribute('aria-invalid', String(invalid));
    if (describedBy.length) field.setAttribute('aria-describedby', describedBy.join(' '));
    else field.removeAttribute('aria-describedby');
  });
}

// Сброс подсветки ошибок (после успешной отправки или при повторном открытии модалки)
function resetValidation(form) {
  form.classList.remove('was-validated');
  form.querySelectorAll('[aria-errormessage]').forEach((field) => {
    field.removeAttribute('aria-invalid');
    const errorId = field.getAttribute('aria-errormessage');
    const describedBy = (field.getAttribute('aria-describedby') ?? '').split(' ').filter((id) => id && id !== errorId);
    if (describedBy.length) field.setAttribute('aria-describedby', describedBy.join(' '));
    else field.removeAttribute('aria-describedby');
  });
}

// Bootstrap-валидация: подсвечиваем поля и вызываем handler только для валидной формы.
// Пока handler ждёт ответа API, кнопка отправки заблокирована.
function onValidSubmit(form, handler) {
  // После первой попытки отправки статус полей обновляется по мере ввода
  const resync = () => {
    if (form.classList.contains('was-validated')) queueMicrotask(() => syncValidity(form));
  };
  form.addEventListener('input', resync);
  form.addEventListener('change', resync);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    form.classList.add('was-validated');
    syncValidity(form);

    if (!form.checkValidity()) {
      form.querySelector(':invalid')?.focus();
      return;
    }

    const submit = form.querySelector('[type="submit"]') ?? document.querySelector(`[type="submit"][form="${form.id}"]`);
    submit?.setAttribute('disabled', '');
    try {
      await handler(new FormData(form), form);
    } finally {
      submit?.removeAttribute('disabled');
    }
  });
}

// Сообщение об ошибке внутри формы (alert над кнопкой)
function showFormError(form, message) {
  const alert = form.querySelector('[data-form-error]');
  alert.textContent = message;
  alert.classList.toggle('d-none', !message);
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

// Плавная прокрутка только если пользователь не просил уменьшить анимацию
function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.toast-container')) createToastContainer();
  renderAuthState();
  initLogout();
  initPasswordToggles();

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
