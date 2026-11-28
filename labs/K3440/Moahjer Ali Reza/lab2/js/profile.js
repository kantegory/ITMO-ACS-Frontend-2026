// Личный кабинет: данные профиля берём и сохраняем через API

function renderProfile(user) {
  document.getElementById("profile-email").textContent = user.email;
  document.getElementById("profile-name").value = user.name;
  document.getElementById("profile-phone").value = user.phone || "";
}

function setupProfileForm() {
  const form = document.getElementById("profile-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    try {
      const user = await updateMe({
        name: document.getElementById("profile-name").value.trim(),
        phone: document.getElementById("profile-phone").value.trim(),
      });
      setCurrentUser(user);
      showMessage("Данные сохранены", "success");
    } catch (err) {
      showMessage(err.message, "danger");
    }
  });

  document.getElementById("delete-account-btn").addEventListener("click", async () => {
    if (!confirm("Удалить аккаунт?")) return;
    try {
      await deleteMe();
      clearSession();
      window.location.href = "index.html";
    } catch (err) {
      showMessage(err.message, "danger");
    }
  });
}

async function setupProfilePage() {
  if (!document.getElementById("profile-form")) return;

  // без токена в кабинет нельзя
  if (!getToken()) {
    window.location.href = "login.html";
    return;
  }

  try {
    renderProfile(await getMe());
  } catch (err) {
    // токен недействителен (например, сервер перезапустили) — отправляем на вход
    if (err.status === 401) {
      clearSession();
      window.location.href = "login.html";
      return;
    }
    showMessage(err.message, "danger");
    return;
  }
  setupProfileForm();
}

setupProfilePage();
