// Вход и регистрация (учебный вариант: пользователи хранятся в localStorage)

function getUsers() {
  return JSON.parse(localStorage.getItem("carpetshop_users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("carpetshop_users", JSON.stringify(users));
}

function showError(id, text) {
  const box = document.getElementById(id);
  box.textContent = text;
  box.classList.remove("d-none");
}

function setupLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("login-error").classList.add("d-none");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const user = getUsers().find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) {
      showError("login-error", "Неверный email или пароль.");
      return;
    }

    setCurrentUser({ name: user.name, email: user.email, phone: user.phone });
    window.location.href = "profile.html";
  });
}

function setupRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const password2 = document.getElementById("reg-password2");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("register-error").classList.add("d-none");

    // проверка, что пароли совпадают
    const password = document.getElementById("reg-password").value;
    password2.setCustomValidity(password !== password2.value ? "mismatch" : "");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      showError(
        "register-error",
        "Пользователь с таким email уже зарегистрирован.",
      );
      return;
    }

    users.push({ name: name, email: email, phone: phone, password: password });
    saveUsers(users);
    setCurrentUser({ name: name, email: email, phone: phone });
    window.location.href = "profile.html";
  });

  password2.addEventListener("input", () => password2.setCustomValidity(""));
}

setupLoginForm();
setupRegisterForm();
