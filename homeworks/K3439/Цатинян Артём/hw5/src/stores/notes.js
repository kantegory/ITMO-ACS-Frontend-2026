import { defineStore } from "pinia";
import { notesApi } from "../api/notes";

export const useNotesStore = defineStore("notes", {
  state: () => ({
    notes: [],
    draft: { name: "", text: "" },
    loading: false,
    saving: false,
    error: "",
  }),
  persist: { pick: ["draft"] },
  actions: {
    async loadNotes() {
      this.loading = true;
      this.error = "";
      try {
        this.notes = await notesApi.getAll();
      } catch {
        this.error =
          "Не удалось загрузить заметки. Проверьте, что сервер API запущен.";
      } finally {
        this.loading = false;
      }
    },
    async createNote(note) {
      this.saving = true;
      this.error = "";
      try {
        const created = await notesApi.create(note);
        this.notes.unshift(created);
        return true;
      } catch {
        this.error = "Не удалось сохранить заметку. Попробуйте ещё раз.";
        return false;
      } finally {
        this.saving = false;
      }
    },
  },
});
