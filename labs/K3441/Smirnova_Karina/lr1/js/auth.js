// Отправляет форму входа и сохраняет полученный токен.
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const passwordInput = document.getElementById('loginPassword');
  const passwordFeedback = document.getElementById('loginPasswordFeedback');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    passwordInput.setCustomValidity('');
    passwordFeedback.textContent = 'Пароль должен содержать минимум 8 символов.';
    loginForm.classList.add('was-validated');

    if (!loginForm.checkValidity()) return;

    try {
      const result = await loginUser(
        document.getElementById('loginEmail').value,
        passwordInput.value,
      );

      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      window.location.href = 'search.html';
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        passwordInput.setCustomValidity('Неверная электронная почта или пароль');
        passwordFeedback.textContent = 'Неверная электронная почта или пароль.';
      } else {
        showMessage('Не удалось подключиться к серверу');
      }
    }
  });

  passwordInput.addEventListener('input', () => {
    passwordInput.setCustomValidity('');
    passwordFeedback.textContent = 'Пароль должен содержать минимум 8 символов.';
  });
}

// Проверяет форму регистрации и отправляет данные нового пользователя.
function setupRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  const password = document.getElementById('registerPassword');
  const repeatPassword = document.getElementById('repeatPassword');

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    repeatPassword.setCustomValidity(
      password.value === repeatPassword.value ? '' : 'Пароли не совпадают',
    );
    registerForm.classList.add('was-validated');

    if (!registerForm.checkValidity()) return;

    try {
      await registerUser({
        name: document.getElementById('username').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        password: password.value,
      });

      bootstrap.Modal.getOrCreateInstance(document.getElementById('successModal')).show();
    } catch (error) {
      if (error.response?.status === 400) {
        showMessage('Пользователь с такой электронной почтой уже существует');
      } else {
        showMessage('Не удалось создать аккаунт');
      }
    }
  });

  repeatPassword.addEventListener('input', () => {
    repeatPassword.setCustomValidity('');
  });
}

// Запускает обработчики форм авторизации после загрузки страницы.
document.addEventListener('DOMContentLoaded', () => {
  setupLoginForm();
  setupRegisterForm();
});
