const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-proxy-server"],
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto("http://127.0.0.1:3012/index.html", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => document.querySelectorAll("#catalog .restaurant").length === 6,
    );
    await page.getByRole("button", { name: "Итальянская" }).click();
    await page.waitForFunction(
      () => document.querySelectorAll("#catalog .restaurant").length === 2,
    );
    await page.goto("http://127.0.0.1:3012/register.html", {
      waitUntil: "domcontentloaded",
    });
    await page.locator("[name=name]").fill("Артём");
    await page
      .locator("[name=email]")
      .fill("page" + Date.now() + "@example.com");
    await page.locator("[name=password]").fill("password123");
    await page.locator("#register-form button:not([type=button])").click();
    await page.getByText("Пока нет бронирований").waitFor();
    await page.goto("http://127.0.0.1:3012/restaurant.html?id=1", {
      waitUntil: "domcontentloaded",
    });
    await page
      .locator("#booking-form [name=date]")
      .fill(new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10));
    await page.locator("#booking-form button").click();
    await page.getByRole("link", { name: "Изменить бронь" }).waitFor();
    await page.getByRole("link", { name: "Изменить бронь" }).click();
    await page.getByRole("button", { name: "Сохранить изменения" }).waitFor();
    await page.locator("#booking-form [name=guests]").selectOption("4");
    await page.locator("#booking-form button").click();
    await page.getByText(/Гостей: 4/).waitFor();
    page.on("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Отменить" }).click();
    await page.getByText("Пока нет бронирований").waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    assert.deepEqual(errors, []);
    console.log(
      "Pages: filters, registration, create/edit/cancel booking and mobile layout passed.",
    );
  } finally {
    await browser.close();
  }
})();
