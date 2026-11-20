import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api, { TOKEN_KEY } from "../api.js";

const USER_KEY = "fitnessPlatformVueUser";
export const useAuthStore = defineStore("auth", () => {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    localStorage.removeItem(USER_KEY);
  }
  const user = ref(saved);
  const token = ref(localStorage.getItem(TOKEN_KEY) || "");
  const authenticated = computed(() => Boolean(user.value?.id && token.value));
  function logout() {
    user.value = null;
    token.value = "";
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
  async function authenticate(mode, data) {
    const result = await api.post("/" + mode, data);
    user.value = result.user;
    token.value = result.accessToken;
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    localStorage.setItem(TOKEN_KEY, result.accessToken);
  }
  async function validate() {
    if (!authenticated.value) return false;
    try {
      user.value = await api.get("/users/" + encodeURIComponent(user.value.id));
      return true;
    } catch (error) {
      if ([401, 403, 404].includes(error.status)) {
        logout();
        return false;
      }
      throw error;
    }
  }
  return { user, authenticated, authenticate, logout, validate };
});
