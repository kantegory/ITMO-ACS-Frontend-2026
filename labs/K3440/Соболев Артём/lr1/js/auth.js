// Формы входа/регистрации, кнопки пароля, выход и защита личных страниц.
import { api } from "./api.js";
import { USER_KEY, readStoredUser, getToken, saveSession, clearSession } from "./session.js";
import { showFormError } from "./utils.js";

export function setupLogout() {
  const user = readStoredUser();
  document.querySelectorAll("[data-login-link]").forEach((link) => {
    if (!user || !getToken()) return;
    link.textContent = "Выйти";
    link.href = "index.html";
    link.classList.remove("rounded-pill");
    link.dataset.logout = "true";
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-logout]");
    if (!link) return;
    event.preventDefault();
    clearSession();
    location.href = "index.html";
  });
}

export function setupAccountGuard() {
  const protectedPage = ["/account.html", "/history.html"].find((page) =>
    location.pathname.endsWith(page),
  );
  if (!protectedPage) return;
  if (!getToken()) {
    location.replace(`login.html?next=${protectedPage.slice(1)}`);
    return;
  }
  const user = readStoredUser();
  if (!user) {
    clearSession();
    location.replace(`login.html?next=${protectedPage.slice(1)}`);
    return;
  }
  api(`/users/${encodeURIComponent(user.id)}`)
    .then((user) => {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      document
        .querySelector("[data-user-name]")
        ?.replaceChildren(document.createTextNode(user.name));
    })
    .catch(() => {
      clearSession();
      location.replace(`login.html?next=${protectedPage.slice(1)}`);
    });
}

// Обработчики форм входа и регистрации.
export function setupPasswordToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const input = document.getElementById(button.dataset.passwordToggle);
    if (!input) return;
    button.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute(
        "aria-label",
        show ? "Скрыть пароль" : "Показать пароль",
      );
      button.setAttribute("aria-pressed", String(show));
    });
  });
}

export function setupPasswordConfirmation() {
  const form = document.querySelector('[data-demo-form="register"]');
  if (!form) return;
  const password = form.querySelector("#password");
  const confirmation = form.querySelector("#passwordConfirm");
  const message = form.querySelector("#passwordMismatch");
  const validate = () => {
    const mismatch =
      Boolean(confirmation.value) && password.value !== confirmation.value;
    confirmation.setCustomValidity(mismatch ? "Пароли не совпадают." : "");
    if (message) message.hidden = !mismatch;
  };
  password.addEventListener("input", validate);
  confirmation.addEventListener("input", validate);
}

export function setupAuthForms() {
  document.querySelectorAll("[data-demo-form]").forEach((form) =>
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const email = form.querySelector('[type="email"]').value.trim();
      const password = form.querySelector("#password").value;
      const register = form.dataset.demoForm === "register";
      const payload = { email, password };
      if (register) payload.name = form.querySelector("#name").value.trim();
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        const session = await api(register ? "/register" : "/login", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        saveSession(session);
        const next = new URLSearchParams(location.search).get("next");
        location.href =
          next === "history.html" ? "history.html" : "account.html";
      } catch (error) {
        showFormError(form, error.message);
        submit.disabled = false;
      }
    }),
  );
}


