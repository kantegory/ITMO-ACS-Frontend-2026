// Отмечает невалидные поля и переводит фокус к первой ошибке.
function exposeFormErrors(form, statusElement) {
  const controls = Array.from(form.querySelectorAll('input, select, textarea'));
  controls.forEach((control) => {
    control.setAttribute('aria-invalid', String(!control.checkValidity()));
  });
  const firstInvalid = controls.find((control) => !control.checkValidity());
  if (firstInvalid) {
    statusElement.textContent = firstInvalid.validationMessage || 'Проверьте заполнение формы.';
    firstInvalid.focus();
  }
  return !firstInvalid;
}

// Отправляет форму входа и сохраняет полученный токен.
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const passwordInput = document.getElementById('loginPassword');
  const passwordFeedback = document.getElementById('loginPasswordFeedback');
  const formStatus = document.getElementById('loginFormStatus');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    passwordInput.setCustomValidity('');
    passwordFeedback.textContent = 'Пароль должен содержать минимум 8 символов.';
    loginForm.classList.add('was-validated');

    if (!exposeFormErrors(loginForm, formStatus)) return;

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
        passwordInput.setAttribute('aria-invalid', 'true');
        formStatus.textContent = passwordFeedback.textContent;
        passwordInput.focus();
      } else {
        showMessage('Не удалось подключиться к серверу');
      }
    }
  });

  passwordInput.addEventListener('input', () => {
    passwordInput.setCustomValidity('');
    passwordInput.setAttribute('aria-invalid', 'false');
    formStatus.textContent = '';
    passwordFeedback.textContent = 'Пароль должен содержать минимум 8 символов.';
  });

  loginForm.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => input.setAttribute('aria-invalid', String(!input.checkValidity())));
  });
}

// Проверяет форму регистрации и отправляет данные нового пользователя.
function setupRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  const password = document.getElementById('registerPassword');
  const repeatPassword = document.getElementById('repeatPassword');
  const formStatus = document.getElementById('registerFormStatus');

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    repeatPassword.setCustomValidity(
      password.value === repeatPassword.value ? '' : 'Пароли не совпадают',
    );
    registerForm.classList.add('was-validated');

    if (!exposeFormErrors(registerForm, formStatus)) return;

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
    repeatPassword.setAttribute('aria-invalid', 'false');
    formStatus.textContent = '';
  });

  registerForm.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => input.setAttribute('aria-invalid', String(!input.checkValidity())));
  });
}

// Запускает обработчики форм авторизации после загрузки страницы.
document.addEventListener('DOMContentLoaded', () => {
  setupLoginForm();
  setupRegisterForm();
});
