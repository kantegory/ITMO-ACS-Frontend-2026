// Личный кабинет: профиль, корзина, заказы, отзывы

function renderProfile() {
  const user = getCurrentUser();
  document.getElementById("profile-email").textContent = user.email;
  document.getElementById("profile-name").value = user.name;
  document.getElementById("profile-phone").value = user.phone || "";
}

function setupProfileForm() {
  const form = document.getElementById("profile-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const user = getCurrentUser();
    user.name = document.getElementById("profile-name").value.trim();
    user.phone = document.getElementById("profile-phone").value.trim();
    setCurrentUser(user);

    // обновляем и в общем списке пользователей
    const users = getUsers();
    const saved = users.find((u) => u.email === user.email);
    if (saved) {
      saved.name = user.name;
      saved.phone = user.phone;
      saveUsers(users);
    }
    showMessage("Данные сохранены", "success");
  });

  document
    .getElementById("delete-account-btn")
    .addEventListener("click", () => {
      if (!confirm("Удалить аккаунт?")) return;
      const user = getCurrentUser();
      saveUsers(getUsers().filter((u) => u.email !== user.email));
      logout();
    });
}

function setupProfilePage() {
  if (!document.getElementById("profile-form")) return;

  // без входа в кабинет нельзя
  if (!getCurrentUser()) {
    window.location.href = "login.html";
    return;
  }

  renderProfile();
  setupProfileForm();
}

setupProfilePage();
