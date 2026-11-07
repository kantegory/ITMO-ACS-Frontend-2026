const { chromium } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const assert = require("node:assert/strict");

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-proxy-server"],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    for (const path of [
      "index.html",
      "login.html",
      "register.html",
      "restaurant.html?id=1",
    ]) {
      await page.goto(`http://127.0.0.1:3012/${path}`, {
        waitUntil: "domcontentloaded",
      });
      if (path === "index.html") {
        await page.waitForSelector("#catalog .restaurant");
        await page.waitForFunction(
          () => document.querySelectorAll("#catalog .restaurant").length === 6,
        );
      }
      if (path.startsWith("restaurant"))
        await page.waitForFunction(
          () => document.querySelector("#booking-time").options.length === 7,
        );
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      console.log(
        path,
        JSON.stringify(
          results.violations.map(({ id, impact, nodes }) => ({
            id,
            impact,
            nodes: nodes.map((n) => n.target),
          })),
        ),
      );
      assert.equal(
        results.violations.length,
        0,
        `Accessibility violations on ${path}`,
      );
    }
    await page.goto("http://127.0.0.1:3012/index.html", {
      waitUntil: "domcontentloaded",
    });
    await page.keyboard.press("Tab");
    assert.equal(
      await page.locator(":focus").textContent(),
      "Перейти к основному содержимому",
    );
    await page.keyboard.press("Enter");
    assert.equal(
      await page.locator(":focus").getAttribute("id"),
      "main-content",
    );
    const menu = page.getByRole("button", { name: "Открыть меню навигации" });
    await menu.click();
    assert.equal(await menu.getAttribute("aria-expanded"), "true");
    await menu.click();
    await page.goto("http://127.0.0.1:3012/register.html", {
      waitUntil: "domcontentloaded",
    });
    await page.locator('[name="name"]').fill("Тест доступности");
    await page.locator('[name="email"]').fill(`a11y${Date.now()}@example.com`);
    await page.locator('[name="password"]').fill("password123");
    await page.locator("#register-form button:not([type=button])").click();
    await page.getByText("Пока нет бронирований").waitFor();
    const profile = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    console.log(
      "profile.html",
      JSON.stringify(profile.violations.map(({ id }) => id)),
    );
    assert.equal(profile.violations.length, 0);
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
