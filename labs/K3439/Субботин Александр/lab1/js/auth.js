// Вход, регистрация и восстановление пароля.
// В ЛР1 сервера нет: аккаунты складываются в localStorage, пароль не храним.

const ACCOUNTS_KEY = 'stolik-accounts';

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function nameFromEmail(email) {
  const login = email.split('@')[0];
  return login.charAt(0).toUpperCase() + login.slice(1);
}

function initLoginForm() {
  const form = document.querySelector('#loginForm');
  if (!form) return;

  onValidSubmit(form, (data) => {
    const email = data.get('email').trim().toLowerCase();
    const account = getAccounts().find((acc) => acc.email === email);

    saveUser({ name: account?.name ?? nameFromEmail(email), email, phone: account?.phone ?? '' });
    window.location.href = 'profile.html';
  });
}

function initRegisterForm() {
  const form = document.querySelector('#registerForm');
  if (!form) return;

  const password = form.querySelector('#registerPassword');
  const confirm = form.querySelector('#registerPasswordConfirm');

  // Пароли должны совпадать — сообщаем об этом через Constraint Validation API
  const checkPasswordsMatch = () => {
    confirm.setCustomValidity(confirm.value && confirm.value !== password.value ? 'mismatch' : '');
  };
  password.addEventListener('input', checkPasswordsMatch);
  confirm.addEventListener('input', checkPasswordsMatch);

  onValidSubmit(form, (data) => {
    const user = {
      name: data.get('name').trim(),
      email: data.get('email').trim().toLowerCase(),
      phone: data.get('phone').trim(),
    };

    const accounts = getAccounts().filter((acc) => acc.email !== user.email);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, user]));
    saveUser(user);
    window.location.href = 'profile.html';
  });
}

function initResetForm() {
  const form = document.querySelector('#resetForm');
  if (!form) return;

  onValidSubmit(form, (data, resetForm) => {
    bootstrap.Modal.getOrCreateInstance('#resetModal').hide();
    showToast(`Ссылка для сброса пароля отправлена на ${data.get('email')}`);
    resetForm.reset();
    resetForm.classList.remove('was-validated');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
  initResetForm();
});
