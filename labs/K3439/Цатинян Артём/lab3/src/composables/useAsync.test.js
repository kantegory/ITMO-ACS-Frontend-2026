import { describe, expect, it } from "vitest";
import { useAsync } from "./useAsync";

describe("useAsync", () => {
  it("returns the result and resets loading", async () => {
    const state = useAsync();
    expect(await state.run(async () => "готово")).toBe("готово");
    expect(state.loading.value).toBe(false);
    expect(state.error.value).toBe("");
  });

  it("exposes errors and clears them on retry", async () => {
    const state = useAsync();
    expect(
      await state.run(async () => {
        throw new Error("Нет связи");
      }),
    ).toBeNull();
    expect(state.error.value).toBe("Нет связи");
    expect(state.loading.value).toBe(false);
    expect(await state.run(async () => 42)).toBe(42);
    expect(state.error.value).toBe("");
  });
});
