// Вход и регистрация через API

function showError(id, text) {
  const box = document.getElementById(id);
  box.textContent = text;
  box.classList.remove("d-none");
}

function setupLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("login-error").classList.add("d-none");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    try {
      const data = await loginRequest({
        email: document.getElementById("login-email").value.trim(),
        password: document.getElementById("login-password").value,
      });
      saveSession(data);
      window.location.href = "profile.html";
    } catch (err) {
      showError("login-error", err.message);
    }
  });
}

function setupRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const password2 = document.getElementById("reg-password2");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("register-error").classList.add("d-none");

    // проверка, что пароли совпадают
    const password = document.getElementById("reg-password").value;
    password2.setCustomValidity(password !== password2.value ? "mismatch" : "");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    try {
      const data = await registerRequest({
        name: document.getElementById("reg-name").value.trim(),
        email: document.getElementById("reg-email").value.trim(),
        phone: document.getElementById("reg-phone").value.trim(),
        password: password,
      });
      saveSession(data);
      window.location.href = "profile.html";
    } catch (err) {
      showError("register-error", err.message);
    }
  });

  password2.addEventListener("input", () => password2.setCustomValidity(""));
}

setupLoginForm();
setupRegisterForm();
