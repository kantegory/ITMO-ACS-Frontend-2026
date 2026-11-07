import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { notesApi } from "../api/notes";
import { useNotesStore } from "./notes";

vi.mock("../api/notes", () => ({
  notesApi: { getAll: vi.fn(), create: vi.fn() },
}));

describe("notes store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  it("loads notes and clears the loading state", async () => {
    notesApi.getAll.mockResolvedValue([{ id: 1, name: "Идея" }]);
    const store = useNotesStore();
    await store.loadNotes();
    expect(store.notes).toEqual([{ id: 1, name: "Идея" }]);
    expect(store.loading).toBe(false);
  });

  it("creates a note through the API", async () => {
    notesApi.create.mockResolvedValue({ id: 2, name: "Планы" });
    const store = useNotesStore();
    expect(await store.createNote({ name: "Планы" })).toBe(true);
    expect(store.notes).toHaveLength(1);
    expect(store.notes[0].name).toBe("Планы");
  });

  it("preserves existing notes and reports API failure", async () => {
    notesApi.create.mockRejectedValue(new Error("offline"));
    const store = useNotesStore();
    store.notes = [{ id: 1, name: "Идея" }];
    expect(await store.createNote({ name: "Планы" })).toBe(false);
    expect(store.notes).toHaveLength(1);
    expect(store.error).toContain("Не удалось сохранить");
    expect(store.saving).toBe(false);
  });
});
