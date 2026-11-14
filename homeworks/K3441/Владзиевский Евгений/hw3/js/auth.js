// Вход и регистрация. Пока без сервера: пользователь хранится в localStorage.

document.querySelectorAll('[data-toggle-password]').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.togglePassword);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');
    btn.innerHTML = `<i class="bi ${show ? 'bi-eye-slash' : 'bi-eye'}" aria-hidden="true"></i>`;
  });
});

function loginAs(user) {
  storage.set('klyuchi:user', user);
  window.location.href = 'profile.html';
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  bindValidation(loginForm, (data) => {
    const saved = storage.get('klyuchi:account', null);
    const email = data.get('email').trim().toLowerCase();
    // Если аккаунт создан через регистрацию, сверяем пароль
    if (saved && saved.email === email && saved.password !== data.get('password')) {
      document.getElementById('login-error').classList.remove('d-none');
      return;
    }
    loginAs(saved && saved.email === email
      ? { name: saved.name, email, role: saved.role }
      : { name: 'Евгений Владзиевский', email, role: 'tenant' });
  });

  document.querySelector('[data-demo-login]').addEventListener('click', () => {
    loginAs({ name: 'Евгений Владзиевский', email: 'demo@klyuchi.ru', role: 'tenant' });
  });

  const resetForm = document.getElementById('reset-form');
  bindValidation(resetForm, () => {
    bootstrap.Modal.getInstance(document.getElementById('resetModal')).hide();
    showToast('Отправили ссылку для сброса пароля');
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  const pass = document.getElementById('reg-password');
  const pass2 = document.getElementById('reg-password2');
  const checkMatch = () => pass2.setCustomValidity(pass.value === pass2.value ? '' : 'mismatch');
  pass.addEventListener('input', checkMatch);
  pass2.addEventListener('input', checkMatch);

  bindValidation(registerForm, (data) => {
    const account = {
      name: `${data.get('first').trim()} ${data.get('last').trim()}`,
      email: data.get('email').trim().toLowerCase(),
      password: data.get('password'),
      role: data.get('role')
    };
    storage.set('klyuchi:account', account);
    loginAs({ name: account.name, email: account.email, role: account.role });
  });
}
