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
      colorScheme: "dark",
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    const base = "http://127.0.0.1:3012/";
    await page.goto(base + "index.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.querySelectorAll("#catalog .restaurant").length === 6,
    );
    assert.equal(
      await page.locator("html").getAttribute("data-bs-theme"),
      "dark",
    );
    for (const path of [
      "index.html",
      "login.html",
      "register.html",
      "restaurant.html?id=1",
    ]) {
      await page.goto(base + path, { waitUntil: "domcontentloaded" });
      await page.locator(".theme-toggle").waitFor();
      if (path.startsWith("restaurant"))
        await page.waitForFunction(
          () => document.querySelector("#booking-time").options.length === 7,
        );
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      console.log(
        path,
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      );
      assert.equal(result.violations.length, 0);
    }
    await page.goto(base + "register.html", { waitUntil: "domcontentloaded" });
    await page.locator('[name="name"]').fill("Тест темы");
    await page.locator('[name="email"]').fill(`theme${Date.now()}@example.com`);
    await page.locator('[name="password"]').fill("password123");
    await page.locator("#register-form button:not([type=button])").click();
    await page.getByText("Пока нет бронирований").waitFor();
    const profileAudit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    console.log(
      "profile.html",
      JSON.stringify(
        profileAudit.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ),
    );
    assert.equal(profileAudit.violations.length, 0);
    await page.getByRole("button", { name: "Включить светлую тему" }).click();
    assert.equal(
      await page.locator("html").getAttribute("data-bs-theme"),
      "light",
    );
    await page.goto(base + "login.html", { waitUntil: "domcontentloaded" });
    assert.equal(
      await page.locator("html").getAttribute("data-bs-theme"),
      "light",
    );
    await page.reload({ waitUntil: "domcontentloaded" });
    assert.equal(
      await page.locator("html").getAttribute("data-bs-theme"),
      "light",
    );
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      for (const path of [
        "index.html",
        "login.html",
        "register.html",
        "restaurant.html?id=1",
        "profile.html",
      ]) {
        await page.goto(base + path, { waitUntil: "domcontentloaded" });
        await page.locator(".theme-toggle").waitFor();
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) {
          console.log(await page.evaluate(() => [...document.querySelectorAll("*")].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => [el.tagName, el.className, el.getBoundingClientRect().right])));
        }
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `Horizontal overflow at ${width}px on ${path}`,
        );
        const boxes = await page
          .locator("nav .container > *:visible")
          .evaluateAll((elements) =>
            elements.map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
              };
            }),
          );
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i],
              b = boxes[j];
            assert.ok(
              a.right <= b.left ||
                b.right <= a.left ||
                a.bottom <= b.top ||
                b.bottom <= a.top,
              `Overlapping navigation at ${width}px on ${path}`,
            );
          }
      }
    }
    console.log("System preference, theme switch and persistence passed.");
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
