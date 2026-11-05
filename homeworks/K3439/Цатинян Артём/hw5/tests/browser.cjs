const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-proxy-server"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  let createdId;
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto("http://127.0.0.1:8080", { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "Мои заметки" }).waitFor();
    await page.getByRole("heading", { name: "Идея для выходных" }).waitFor();
    const title = `Проверка ${Date.now()}`;
    await page.getByLabel("Название").fill(title);
    await page.getByLabel("Текст заметки").fill("Проверка сохранения.");
    await page.reload({ waitUntil: "domcontentloaded" });
    assert.equal(await page.getByLabel("Название").inputValue(), title);
    assert.equal(
      await page.getByLabel("Текст заметки").inputValue(),
      "Проверка сохранения.",
    );
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/notes") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Добавить заметку" }).click();
    const response = await responsePromise;
    createdId = (await response.json()).id;
    await page.getByRole("heading", { name: title }).waitFor();
    assert.equal(await page.getByLabel("Название").inputValue(), "");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: title }).waitFor();
    await page.setViewportSize({ width: 375, height: 812 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    assert.deepEqual(errors, []);
    console.log(
      "Browser checks passed: draft, create, persistence, mobile layout.",
    );
  } finally {
    if (createdId)
      await page.request.delete(
        `http://127.0.0.1:3003/notes/${encodeURIComponent(createdId)}`,
      );
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
