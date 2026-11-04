// Логика форм входа и регистрации (демо: данные хранятся в localStorage)
function getUsers() {
  return JSON.parse(localStorage.getItem("tablebook_users") || "[]");
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem("tablebook_users", JSON.stringify(users));
}

function setupLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("login-error");
    errorBox.classList.add("d-none");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const email = document.getElementById("l-email").value.trim();
    const password = document.getElementById("l-password").value;
    const users = getUsers();
    let user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      user = { name: email.split("@")[0], email, password };
      saveUser(user);
    }

    localStorage.setItem("tablebook_user", JSON.stringify({ name: user.name, email: user.email }));
    window.location.href = "profile.html";
  });
}

function setupRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
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

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      errorBox.textContent = "Пользователь с таким email уже зарегистрирован.";
      errorBox.classList.remove("d-none");
      return;
    }

    saveUser({ name, email, password });
    localStorage.setItem("tablebook_user", JSON.stringify({ name, email }));
    window.location.href = "profile.html";
  });

  document.getElementById("r-password2").addEventListener("input", () => {
    document.getElementById("r-password2").setCustomValidity("");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupLoginForm();
  setupRegisterForm();
});
