const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-proxy-server"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto("http://127.0.0.1:8081/", {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("heading", { name: "Cielo" }).waitFor();
    assert.equal(await page.locator(".restaurant-card").count(), 6);
    if (process.env.TABLELY_SCREENSHOT) {
      await page.screenshot({ path: process.env.TABLELY_SCREENSHOT });
    }
    await page.getByRole("button", { name: "Итальянская" }).click();
    await page.waitForFunction(
      () => document.querySelectorAll(".restaurant-card").length === 2,
    );
    const date = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);
    await page.getByLabel("Когда").fill(date);
    await page.getByLabel("Гостей").selectOption("3");
    await page.getByRole("link", { name: "Открыть ресторан Cielo" }).click();
    await page.getByRole("heading", { name: "Выбрать столик" }).waitFor();
    assert.equal(await page.getByLabel("Дата").inputValue(), date);
    assert.equal(await page.getByLabel("Гостей").inputValue(), "3");
    await page.getByRole("button", { name: "Забронировать" }).click();
    await page.getByRole("heading", { name: "Войти в аккаунт" }).waitFor();
    await page
      .getByRole("link", { name: "Нет аккаунта? Зарегистрироваться" })
      .click();
    await page.getByLabel("Имя").fill("Тест");
    await page.getByLabel("Почта").fill(`vue${Date.now()}@example.com`);
    await page.getByLabel("Пароль").fill("password123");
    await page.getByRole("button", { name: "Зарегистрироваться" }).click();
    await page.getByRole("heading", { name: "Выбрать столик" }).waitFor();
    assert.equal(await page.getByLabel("Дата").inputValue(), date);
    await page.getByRole("button", { name: "Забронировать" }).click();
    await page.getByRole("link", { name: "Изменить бронь" }).waitFor();
    await page.getByRole("link", { name: "Изменить бронь" }).click();
    await page.getByLabel("Гостей").selectOption("4");
    await page.getByRole("button", { name: "Сохранить изменения" }).click();
    await page.getByText(/Гостей: 4/).waitFor();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Отменить", exact: true }).click();
    await page.getByText("Пока нет бронирований.").waitFor();
    await page.getByRole("button", { name: "Выйти", exact: true }).click();
    await page.waitForURL("http://127.0.0.1:8081/", {
      waitUntil: "domcontentloaded",
    });
    await page.goto("http://127.0.0.1:8081/profile", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForURL(/\/login/, { waitUntil: "domcontentloaded" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://127.0.0.1:8081/", {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("heading", { name: "Cielo" }).waitFor();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.getByRole("button", { name: "Открыть меню навигации" }).click();
    assert.equal(
      await page
        .getByRole("button", { name: "Открыть меню навигации" })
        .getAttribute("aria-expanded"),
      "true",
    );
    const toggle = page.locator(".theme-toggle");
    const before = await page.locator("html").getAttribute("data-bs-theme");
    await toggle.click();
    assert.notEqual(
      await page.locator("html").getAttribute("data-bs-theme"),
      before,
    );
    await page.reload({ waitUntil: "domcontentloaded" });
    assert.notEqual(
      await page.locator("html").getAttribute("data-bs-theme"),
      before,
    );
    assert.deepEqual(errors, []);
    console.log(
      "Browser checks passed: filters, auth, booking CRUD, routing, mobile menu, theme.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
