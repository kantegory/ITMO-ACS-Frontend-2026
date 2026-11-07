import { ref } from "vue";

function readUser() {
  const raw = localStorage.getItem("tablebook_user");
  return raw ? JSON.parse(raw) : null;
}

const user = ref(readUser());

export function useAuth() {
  function setSession(token, loggedInUser) {
    localStorage.setItem("tablebook_token", token);
    localStorage.setItem("tablebook_user", JSON.stringify(loggedInUser));
    user.value = loggedInUser;
  }

  function clearSession() {
    localStorage.removeItem("tablebook_token");
    localStorage.removeItem("tablebook_user");
    user.value = null;
  }

  return { user, setSession, clearSession };
}
