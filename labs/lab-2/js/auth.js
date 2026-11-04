// Логика форм входа и регистрации через моковое API (json-server-auth, JWT)
function setupLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("login-error");
    errorBox.classList.add("d-none");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const email = document.getElementById("l-email").value.trim();
    const password = document.getElementById("l-password").value;

    try {
      const data = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setSession(data.accessToken, { name: data.user.name, email: data.user.email, id: data.user.id });
      window.location.href = "profile.html";
    } catch (err) {
      errorBox.textContent = "Неверный email или пароль.";
      errorBox.classList.remove("d-none");
    }
  });
}

function setupRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("register-error");
    errorBox.classList.add("d-none");

    const password = document.getElementById("r-password").value;
    const password2 = document.getElementById("r-password2").value;
    document.getElementById("r-password2").setCustomValidity(password !== password2 ? "mismatch" : "");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const name = document.getElementById("r-name").value.trim();
    const email = document.getElementById("r-email").value.trim();

    try {
      const data = await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });
      setSession(data.accessToken, { name: data.user.name, email: data.user.email, id: data.user.id });
      window.location.href = "profile.html";
    } catch (err) {
      errorBox.textContent = "Пользователь с таким email уже зарегистрирован.";
      errorBox.classList.remove("d-none");
    }
  });

  document.getElementById("r-password2").addEventListener("input", () => {
    document.getElementById("r-password2").setCustomValidity("");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupLoginForm();
  setupRegisterForm();
});
