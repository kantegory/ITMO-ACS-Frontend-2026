import { computed, ref } from "vue";
import { api } from "../services/api.js";

const stored =
  localStorage.getItem("lozhka_user") ||
  sessionStorage.getItem("lozhka_user");
const user = ref(stored ? JSON.parse(stored) : null);

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(user.value));
  function clearStorage() {
    [localStorage, sessionStorage].forEach((storage) => {
      storage.removeItem("lozhka_token");
      storage.removeItem("lozhka_user");
    });
  }
  function save(data, persistent = true) {
    clearStorage();
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem("lozhka_token", data.accessToken);
    storage.setItem("lozhka_user", JSON.stringify(data.user));
    user.value = data.user;
  }
  async function login(credentials, persistent = true) {
    const { data } = await api.post("/login", credentials);
    save(data, persistent);
  }
  async function register(payload) {
    const { data } = await api.post("/register", payload);
    save(data);
  }
  function logout() {
    clearStorage();
    user.value = null;
  }
  function updateUser(value) {
    const storage = localStorage.getItem("lozhka_token")
      ? localStorage
      : sessionStorage;
    storage.setItem("lozhka_user", JSON.stringify(value));
    user.value = value;
  }
  return { user, isAuthenticated, login, register, logout, updateUser };
}
