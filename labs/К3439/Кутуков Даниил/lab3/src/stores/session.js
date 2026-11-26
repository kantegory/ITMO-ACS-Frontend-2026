import { defineStore } from 'pinia';
import { api } from '../api.js';

export const useSessionStore = defineStore('session', {
  state: () => ({ user: api.currentUser() }),
  actions: {
    async authenticate(mode, fields) {
      this.user = await api[mode](fields);
    },
    async logout() {
      try { await api.logout(); }
      finally { this.sync(); }
    },
    sync() { this.user = api.currentUser(); },
  },
});
