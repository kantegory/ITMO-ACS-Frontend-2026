import { defineStore } from "pinia";
import api, { TOKEN_KEY } from "../api/client";

export const useAuthStore = defineStore("auth", {
  state: () => ({ user: null, initialized: false }),
  actions: {
    async restore() {
      if (this.initialized) return;
      try {
        if (sessionStorage.getItem(TOKEN_KEY)) this.user = await api.get("/me");
      } catch {
        this.user = null;
      } finally {
        this.initialized = true;
      }
    },
    async authenticate(mode, credentials) {
      const result = await api.post(`/${mode}`, credentials);
      sessionStorage.setItem(TOKEN_KEY, result.token);
      this.user = result.user;
    },
    async logout() {
      try {
        await api.post("/logout", {});
      } catch {
        /* The local session can still be cleared. */
      }
      sessionStorage.removeItem(TOKEN_KEY);
      this.user = null;
    },
  },
});
