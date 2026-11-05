import { api } from "./instance";

export const notesApi = {
  async getAll() {
    return (
      await api.get("/notes", { params: { _sort: "id", _order: "desc" } })
    ).data;
  },
  async create(note) {
    return (await api.post("/notes", note)).data;
  },
};
