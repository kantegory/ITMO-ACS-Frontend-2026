import { api, tokenKey } from "./api.js";
import { showError } from "./ui.js";
document.querySelectorAll("[data-toggle-password]").forEach(
  (button) =>
    (button.onclick = () => {
      const input = document.getElementById(button.dataset.togglePassword);
      input.type = input.type === "password" ? "text" : "password";
      button.textContent = input.type === "password" ? "Показать" : "Скрыть";
    }),
);
const authForm = document.querySelector("#login-form, #register-form");
if (authForm) {
  const password = authForm.querySelector("input[type=password]");
  password.name = "password";
  password.minLength = 8;
  authForm.onsubmit = async (e) => {
    e.preventDefault();
    const button = authForm.querySelector("button:not([type=button])");
    button.disabled = true;
    try {
      const result = await api(
        authForm.id === "login-form" ? "/login" : "/register",
        "POST",
        Object.fromEntries(new FormData(authForm)),
      );
      sessionStorage.setItem(tokenKey, result.token);
      location.href = "profile.html";
    } catch (err) {
      showError(authForm, err.message);
    } finally {
      button.disabled = false;
    }
  };
}
