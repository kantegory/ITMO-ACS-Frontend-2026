// Показывает Bootstrap Toast, а на страницах без Toast использует обычное окно alert.
function showMessage(message) {
  const toastElement = document.getElementById('appToast');

  if (!toastElement || !window.bootstrap) {
    window.alert(message);
    return;
  }

  toastElement.querySelector('.toast-body').textContent = message;
  bootstrap.Toast.getOrCreateInstance(toastElement).show();
}

// Читает данные авторизованного пользователя из localStorage.
function getCurrentUser() {
  const savedUser = localStorage.getItem('currentUser');

  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

// Получает инициалы из имени пользователя для круглого аватара.
function getUserInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

// Подставляет данные авторизованного пользователя в шапку и профиль.
function renderCurrentUser(user) {
  if (!user) return;

  const displayName = user.name || user.email;
  const initials = getUserInitials(displayName);

  document.querySelectorAll('[data-current-user-name]').forEach((node) => {
    node.textContent = displayName;
  });
  document.querySelectorAll('[data-current-user-avatar]').forEach((node) => {
    node.textContent = initials;
  });

  const profileName = document.getElementById('profileName');
  const profileContacts = document.getElementById('profileContacts');
  const profileNameInput = document.getElementById('profileNameInput');
  const profileEmail = document.getElementById('profileEmail');
  const profilePhone = document.getElementById('profilePhone');

  if (profileName) profileName.textContent = displayName;
  if (profileContacts) profileContacts.textContent = `${user.email} · ${user.phone || 'Телефон не указан'}`;
  if (profileNameInput) profileNameInput.value = displayName;
  if (profileEmail) profileEmail.value = user.email;
  if (profilePhone) profilePhone.value = user.phone || '';
}

// Подключает кнопки показа и скрытия пароля.
function setupPasswordToggles() {
  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;

      input.type = input.type === 'password' ? 'text' : 'password';
      button.setAttribute('aria-label', input.type === 'password' ? 'Показать пароль' : 'Скрыть пароль');
    });
  });
}

// Очищает данные авторизации при нажатии на ссылку «Выйти».
function setupLogout() {
  document.querySelectorAll('[data-logout]').forEach((link) => {
    link.addEventListener('click', () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
    });
  });
}

// Запускает общую логику после загрузки страницы.
document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggles();
  renderCurrentUser(getCurrentUser());
  setupLogout();
});
