const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-proxy-server"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    const response = await page.goto("http://127.0.0.1:3012/icons.svg");
    assert.equal(response.status(), 200);
    const source = await response.text();
    for (const id of ["moon", "sun", "menu", "arrow-up-right", "star"]) {
      assert.ok(source.includes(`id="${id}"`), `Missing icon ${id}`);
    }
    await page.goto("http://127.0.0.1:3012/index.html", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => document.querySelectorAll("#catalog .restaurant").length === 6,
    );
    for (const id of ["menu", "arrow-up-right", "star"]) {
      await page
        .locator(`use[href="icons.svg#${id}"]`)
        .first()
        .waitFor({ state: "attached" });
    }
    const toggle = page.locator(".theme-toggle");
    await toggle.waitFor();
    const before = await toggle.locator("use").getAttribute("href");
    await toggle.click();
    const after = await toggle.locator("use").getAttribute("href");
    assert.notEqual(before, after);
    assert.ok(["icons.svg#moon", "icons.svg#sun"].includes(after));
    await page.goto("http://127.0.0.1:3012/restaurant.html?id=1", {
      waitUntil: "domcontentloaded",
    });
    await page
      .locator('main use[href="icons.svg#star"]')
      .waitFor({ state: "attached" });
    console.log("SVG sprite and icon references verified.");
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
