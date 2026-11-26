import axios from 'axios';
import { defineStore } from 'pinia';

const api = axios.create({ baseURL: '/api', timeout: 5000 });

export const useNotes = defineStore('notes', {
  state: () => ({ items: [], busy: false, error: '' }),
  actions: {
    async load() {
      this.busy = true;
      this.error = '';
      try { this.items = (await api.get('/notes')).data; }
      catch { this.error = 'Не удалось загрузить заметки. Проверьте, запущен ли API.'; }
      finally { this.busy = false; }
    },
    async create(values) {
      this.busy = true;
      this.error = '';
      try {
        this.items.push((await api.post('/notes', values)).data);
        return true;
      } catch {
        this.error = 'Не удалось сохранить заметку. Попробуйте ещё раз.';
        return false;
      } finally { this.busy = false; }
    },
  },
});
