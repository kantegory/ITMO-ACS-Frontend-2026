// Вход, регистрация и восстановление пароля через json-server-auth

// После входа возвращаем туда, откуда пришли (?next=profile.html).
// Пропускаем только локальные страницы, чтобы ссылкой нельзя было увести на чужой сайт.
function nextPage() {
  const next = new URLSearchParams(window.location.search).get('next') ?? '';
  return /^[\w-]+\.html(\?[\w=&%-]*)?$/.test(next) ? next : 'profile.html';
}

function initLoginForm() {
  const form = document.querySelector('#loginForm');
  if (!form) return;

  // Уже вошли — на странице входа делать нечего
  if (isLoggedIn()) {
    window.location.replace(nextPage());
    return;
  }

  onValidSubmit(form, async (data) => {
    showFormError(form, '');
    try {
      const { accessToken, user } = await api.login(data.get('email').trim().toLowerCase(), data.get('password'));
      setAuth(accessToken, user);
      window.location.href = nextPage();
    } catch (error) {
      showFormError(form, error.message);
    }
  });
}

function initRegisterForm() {
  const form = document.querySelector('#registerForm');
  if (!form) return;

  if (isLoggedIn()) {
    window.location.replace('profile.html');
    return;
  }

  const password = form.querySelector('#registerPassword');
  const confirm = form.querySelector('#registerPasswordConfirm');

  // Пароли должны совпадать — сообщаем об этом через Constraint Validation API
  const checkPasswordsMatch = () => {
    confirm.setCustomValidity(confirm.value && confirm.value !== password.value ? 'mismatch' : '');
  };
  password.addEventListener('input', checkPasswordsMatch);
  confirm.addEventListener('input', checkPasswordsMatch);

  onValidSubmit(form, async (data) => {
    showFormError(form, '');
    try {
      // json-server-auth сам хеширует пароль и сразу возвращает токен
      const { accessToken, user } = await api.register({
        email: data.get('email').trim().toLowerCase(),
        password: data.get('password'),
        name: data.get('name').trim(),
        phone: data.get('phone').trim(),
        birthday: '',
        createdAt: new Date().toISOString().slice(0, 10),
        notifications: { email: true, sms: true, news: false, remindBefore: 2 },
      });
      setAuth(accessToken, user);
      window.location.href = 'profile.html';
    } catch (error) {
      showFormError(form, error.message);
    }
  });
}

// Отдельного эндпоинта для сброса пароля у json-server-auth нет — только имитация
function initResetForm() {
  const form = document.querySelector('#resetForm');
  if (!form) return;

  onValidSubmit(form, (data, resetForm) => {
    bootstrap.Modal.getOrCreateInstance('#resetModal').hide();
    showToast(`Ссылка для сброса пароля отправлена на ${data.get('email')}`);
    resetForm.reset();
    resetValidation(resetForm);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
  initResetForm();
});
