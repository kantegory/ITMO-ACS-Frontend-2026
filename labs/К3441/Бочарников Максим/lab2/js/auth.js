/**
 * VICE BITES — авторизация (localStorage + json-server-auth)
 */

const Auth = (() => {
  const TOKEN_KEY = "accessToken";
  const USER_KEY = "user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function isLoggedIn() {
    return Boolean(getToken() && getUser());
  }

  function saveSession({ accessToken, user }) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function requireAuth(redirectTo = "login.html") {
    if (!isLoggedIn()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  /** Обновляет ссылки в шапке под статус логина */
  function updateNav() {
    const nav = document.querySelector("#mainNav .navbar-nav");
    if (!nav) return;

    const loginLink = nav.querySelector('[data-nav="login"]');
    const registerLink = nav.querySelector('[data-nav="register"]');
    const logoutItem = nav.querySelector('[data-nav="logout"]');
    const userLabel = nav.querySelector('[data-nav="user"]');

    if (isLoggedIn()) {
      const user = getUser();
      if (loginLink) loginLink.classList.add("d-none");
      if (registerLink) registerLink.classList.add("d-none");
      if (logoutItem) logoutItem.classList.remove("d-none");
      if (userLabel) {
        userLabel.classList.remove("d-none");
        const a = userLabel.querySelector("a");
        if (a) a.textContent = user.name || user.email;
      }
    } else {
      if (loginLink) loginLink.classList.remove("d-none");
      if (registerLink) registerLink.classList.remove("d-none");
      if (logoutItem) logoutItem.classList.add("d-none");
      if (userLabel) userLabel.classList.add("d-none");
    }
  }

  function bindLogout() {
    document.querySelectorAll("[data-logout]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
        window.location.href = "index.html";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateNav();
    bindLogout();
  });

  return {
    getToken,
    getUser,
    isLoggedIn,
    saveSession,
    logout,
    requireAuth,
    updateNav,
  };
})();
