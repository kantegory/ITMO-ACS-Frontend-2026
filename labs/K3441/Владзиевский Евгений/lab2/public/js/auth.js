// Вход и регистрация через json-server-auth.
// POST /api/login и POST /api/register возвращают accessToken и пользователя.

document.querySelectorAll('[data-toggle-password]').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.togglePassword);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');
    btn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="img/sprite.svg#${show ? 'eye-slash' : 'eye'}"></use></svg>`;
  });
});

// После входа возвращаем туда, откуда попросили авторизоваться
function afterLogin() {
  const next = new URLSearchParams(location.search).get('next');
  const safe = next && !/^https?:|^\/\//i.test(next) ? next : 'profile.html';
  window.location.href = safe;
}

function showAuthError(text) {
  const box = document.getElementById('login-error');
  if (!box) return;
  box.textContent = text;
  box.classList.remove('d-none');
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  // Если уже вошли, делать здесь нечего
  if (api.isLogged) window.location.replace('profile.html');

  bindValidation(loginForm, (data) => withPending(loginForm, async () => {
    document.getElementById('login-error').classList.add('d-none');
    try {
      await api.login(data.get('email').trim().toLowerCase(), data.get('password'));
      afterLogin();
    } catch (e) {
      // json-server-auth отвечает 400 с текстом, если пары почта/пароль нет
      if (e.status === 400) showAuthError('Неверная почта или пароль. Проверьте раскладку и попробуйте ещё раз.');
      else showAuthError(e.message);
    }
  }));

  // Кнопка «войти демо-пользователем», чтобы не вводить руками
  document.querySelector('[data-demo-login]').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      await api.login('demo@klyuchi.ru', 'demo1234');
      afterLogin();
    } catch (err) {
      showAuthError(err.message);
      btn.disabled = false;
    }
  });

  const resetForm = document.getElementById('reset-form');
  bindValidation(resetForm, () => {
    // Восстановление пароля json-server-auth не умеет, оставляем заглушку
    bootstrap.Modal.getInstance(document.getElementById('resetModal')).hide();
    showToast('Если такая почта есть, ссылка уже отправлена');
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  if (api.isLogged) window.location.replace('profile.html');

  const pass = document.getElementById('reg-password');
  const pass2 = document.getElementById('reg-password2');
  const checkMatch = () => pass2.setCustomValidity(pass.value === pass2.value ? '' : 'mismatch');
  pass.addEventListener('input', checkMatch);
  pass2.addEventListener('input', checkMatch);

  bindValidation(registerForm, (data) => withPending(registerForm, async () => {
    try {
      await api.register({
        email: data.get('email').trim().toLowerCase(),
        password: data.get('password'),
        name: `${data.get('first').trim()} ${data.get('last').trim()}`,
        role: data.get('role'),
        phone: data.get('phone').trim(),
        since: new Date().toISOString().slice(0, 10),
        verified: false
      });
      window.location.href = 'profile.html';
    } catch (e) {
      // 400 «Email already exists» — самая частая ошибка регистрации
      if (e.status === 400 && /exist/i.test(e.message)) {
        showToast('Такая почта уже зарегистрирована. Попробуйте войти');
        document.getElementById('reg-email').focus();
      } else {
        reportError(e, 'register');
      }
    }
  }));
}
