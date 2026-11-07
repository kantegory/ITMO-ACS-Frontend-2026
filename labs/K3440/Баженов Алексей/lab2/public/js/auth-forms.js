const errorBox = document.getElementById('formError');

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

async function submitAuth(form, path, payload) {
  errorBox.hidden = true;
  const button = form.querySelector('button.btn-accent');
  button.disabled = true;
  try {
    const data = await api.post(path, payload);
    Auth.save(data);
    location.href = safeNext() || 'profile.html';
  } catch (e) {
    showError(e.message);
    button.disabled = false;
  }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAuth(loginForm, '/login', {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
    });
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAuth(registerForm, '/register', {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
    });
  });
}
