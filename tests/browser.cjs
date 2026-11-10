const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const baseURL = process.env.PORTFOLIO_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve("test-results");
fs.mkdirSync(outputDir, { recursive: true });
(async () => {
  // Set BROWSER_CHANNEL=msedge (or chrome) to test a branded browser; defaults to bundled Chromium.
  const channel = process.env.BROWSER_CHANNEL;
  const browser = await chromium.launch({ headless: true, ...(channel && { channel }) });
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  const results = [];
  for (const width of [320, 375, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(baseURL);
    await page.locator("h1").waitFor();
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return (
            r.width &&
            (r.right > innerWidth + 1 || r.left < -1) &&
            !e.classList.contains("skip-link") &&
            !e.classList.contains("sr-only")
          );
        })
        .map((e) => e.tagName + "." + e.className),
    );
    assert.deepEqual(overflow, [], `Overflow at ${width}: ${overflow}`);
    assert.equal(
      await page
        .locator('img:not([loading="lazy"])')
        .evaluateAll((imgs) =>
          imgs.every((i) => i.complete && i.naturalWidth > 0),
        ),
      true,
    );
    if (width <= 900) {
      await page.getByRole("button", { name: "Menu" }).click();
      await page
        .getByRole("navigation")
        .getByRole("link", { name: "Projects", exact: true })
        .click();
      assert.equal(
        await page.locator("#menuToggle").getAttribute("aria-expanded"),
        "false",
      );
      assert.equal(
        await page
          .locator("#projects")
          .evaluate((e) => document.activeElement === e),
        true,
      );
      const menuBox = await page
        .getByRole("button", { name: "Menu" })
        .boundingBox();
      await page.mouse.click(
        menuBox.x + menuBox.width / 2,
        menuBox.y + menuBox.height / 2,
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await page
          .locator("#menuToggle")
          .evaluate((e) => document.activeElement === e),
        true,
      );
      assert.equal(await page.locator("#navMenu").isVisible(), false);
    } else {
      assert.equal(await page.locator("#menuToggle").isVisible(), false);
      assert.equal(await page.locator(".nav-link:visible").count(), 6);
      await page
        .getByRole("navigation")
        .getByRole("link", { name: "Projects", exact: true })
        .click();
    }
    await page.waitForFunction(
      () =>
        document
          .querySelector('.nav-link[href="#projects"]')
          .getAttribute("aria-current") === "location",
    );
    for (const detail of await page.locator("details").all()) {
      await detail.locator("summary").click();
      assert.equal(await detail.getAttribute("open"), "");
      await detail.locator("summary").click();
    }
    const filters = page.getByRole("group", { name: "Filter projects by area" });
    const allCards = await page.locator(".mini-card").count();
    await filters.getByRole("button", { name: "Data & Analytics" }).click();
    const shown = await page.locator(".mini-card:visible").count();
    assert.ok(shown > 0 && shown < allCards, "Filter narrows projects");
    await filters.getByRole("button", { name: "All" }).click();
    assert.equal(await page.locator(".mini-card:visible").count(), allCards);
    for (const picture of await page.locator('img[loading="lazy"]').all()) {
      await picture.scrollIntoViewIfNeeded();
      await picture.evaluate((img) => img.decode());
      assert.equal(await picture.evaluate((img) => img.naturalWidth > 0), true);
    }
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Iqra Nawaz, home" })
      .click();
    await page.screenshot({
      path: path.join(outputDir, `portfolio-${width}.png`),
      fullPage: true,
    });
    results.push({ width, overflow: false, menu: "pass", projects: "pass" });
  }
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(baseURL);
  await page.keyboard.press("Tab");
  assert.equal(
    await page
      .locator(".skip-link")
      .evaluate((e) => document.activeElement === e),
    true,
  );
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator("main").evaluate((e) => document.activeElement === e),
    true,
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: /Download Resume/ }).click(),
  ]);
  assert.equal(download.suggestedFilename(), "Iqra-Nawaz-Resume.pdf");
  assert.equal(await download.failure(), null);
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  await page.getByRole("button", { name: "Menu" }).click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForFunction(
    () => document.querySelector("#menuToggle").hidden,
  );
  assert.equal(await page.locator("#navMenu").isVisible(), true);
  assert.equal(await page.locator("#menuToggle").isVisible(), false);
  const toggle = page.locator("#themeToggle");
  const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await toggle.click();
  const after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.notEqual(before, after, "Theme toggle changes the palette");
  await page.reload();
  assert.equal(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    after,
    "Chosen theme persists across reloads",
  );
  const noJS = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  });
  await noJS.goto(baseURL);
  assert.equal(await noJS.locator("#navMenu").isVisible(), true);
  assert.equal(await noJS.locator("#projects").isVisible(), true);
  assert.equal(await noJS.locator(".project-filters").isVisible(), false);
  assert.equal(
    await noJS.locator(".mini-card:visible").count(),
    await noJS.locator(".mini-card").count(),
  );
  await noJS.close();
  const response = await page.request.get(`${baseURL}/missing`);
  assert.equal(response.status(), 404);
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(outputDir, "browser-results.json"),
    JSON.stringify(
      {
        results,
        errors,
        cvDownload: "pass",
        keyboard: "pass",
        reducedMotion: "pass",
        noJavaScript: "pass",
        resize: "pass",
        notFound: "pass",
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        results,
        errors,
        additional:
          "CV download, keyboard, reduced motion, no-JS, resize and 404 passed",
      },
      null,
      2,
    ),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
