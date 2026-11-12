// Browser regression tests. Start the preview first (`npm run build && npm start`).
// Set BROWSER_CHANNEL=msedge (or chrome) to use a branded browser; defaults to bundled Chromium.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const baseURL = process.env.PORTFOLIO_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve("test-results");
fs.mkdirSync(outputDir, { recursive: true });
const pages = [
  "/",
  "/work/deeptrace-ai.html",
  "/work/resumeiq.html",
  "/work/bank-marketing-intelligence.html",
];
const widths = [320, 375, 430, 768, 1024, 1280, 1440, 1920];

function watch(page, errors) {
  page.on("pageerror", (e) => errors.push(`${page.url()} ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${page.url()} ${m.text()}`));
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("/missing")) errors.push(`${r.status()} ${r.url()}`);
  });
}

async function noOverflow(page, label) {
  const overflow = await page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width && (r.right > innerWidth + 1 || r.left < -1) && !e.closest(".skip-link, .sr-only, .preview, pre");
      })
      .map((e) => `${e.tagName}.${e.className}`),
  );
  assert.deepEqual(overflow, [], `Overflow at ${label}: ${overflow}`);
}

async function loadAllImages(page) {
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll("img[loading=lazy]")) img.loading = "eager";
    await Promise.all([...document.images].filter((i) => i.getAttribute("src")).map((i) => i.decode()));
  });
  const broken = await page.evaluate(() =>
    [...document.images].filter((i) => i.getAttribute("src") && !i.naturalWidth).map((i) => i.src),
  );
  assert.deepEqual(broken, [], `Broken images on ${page.url()}`);
}

(async () => {
  const channel = process.env.BROWSER_CHANNEL;
  const browser = await chromium.launch({ headless: true, ...(channel && { channel }) });
  const errors = [];
  const results = [];

  // 1. Every page, every width: no overflow, images decode, fonts load.
  for (const url of pages) {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      watch(page, errors);
      await page.goto(baseURL + url);
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await noOverflow(page, `${url} @ ${width}px`);
      await loadAllImages(page);
      if (url === "/" && [375, 1440].includes(width))
        await page.screenshot({ path: path.join(outputDir, `home-${width}.png`), fullPage: true });
      await page.close();
    }
    results.push({ url, widths: widths.length, overflow: "none", images: "ok" });
  }

  // 2. Desktop navigation, active section, archive filter, preview, annotations.
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  watch(desktop, errors);
  await desktop.goto(baseURL);
  assert.equal(await desktop.locator("#menuToggle").isVisible(), false);
  assert.equal(await desktop.locator(".nav__link:visible").count(), 7);
  await desktop.getByRole("navigation").getByRole("link", { name: /Archive/ }).click();
  await desktop.waitForFunction(
    () => document.querySelector('.nav__link[href="#archive"]').getAttribute("aria-current") === "location",
  );
  assert.equal(await desktop.locator("#archive").evaluate((e) => document.activeElement === e), true);

  const filters = desktop.getByRole("group", { name: "Filter projects by area" });
  const all = await desktop.locator(".archive__row").count();
  await filters.getByRole("button", { name: "Data Eng" }).click();
  const shown = await desktop.locator(".archive__row:visible").count();
  assert.ok(shown > 0 && shown < all, "Filter narrows the archive");
  assert.equal(await desktop.locator(".filter-status").textContent(), `${shown} projects`);
  // A citation link to a filtered-out row resets the filter and lands on it.
  await desktop.locator('.cite[href="#sentix-project"]').click();
  assert.equal(await desktop.locator(".archive__row:visible").count(), all);
  assert.equal(await desktop.locator("#sentix-project").evaluate((e) => document.activeElement === e), true);

  await filters.getByRole("button", { name: "LLM" }).click();
  assert.equal(await desktop.locator(".archive__row:visible").count(), 1);
  assert.equal(await desktop.locator(".filter-status").textContent(), "1 project");
  await filters.getByRole("button", { name: "All" }).click();
  assert.equal(await desktop.locator(".archive__row:visible").count(), all);

  // Email is shown once, with a copy button that confirms.
  assert.equal(await desktop.locator('a[href^="mailto:"]').count(), 1);
  await desktop.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await desktop.getByRole("button", { name: /Copy email address/ }).click();
  await desktop.waitForFunction(() => document.querySelector(".copy-btn__label").textContent === "Copied");
  assert.equal(await desktop.evaluate(() => navigator.clipboard.readText()), "iqranawaz9353@gmail.com");
  assert.equal(await desktop.locator(".copy-status").textContent(), "Email address copied");

  await desktop.locator("#warehouse-project").hover();
  await desktop.waitForFunction(() => document.querySelector(".preview").classList.contains("is-visible"));
  await desktop.locator('.notes li[data-note="2"]').hover();
  assert.equal(await desktop.locator('.pin[data-note="2"]').evaluate((e) => e.classList.contains("is-active")), true);

  // Theme toggle changes the palette and persists.
  const bg = () => desktop.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const before = await bg();
  await desktop.locator("#themeToggle").click();
  await desktop.waitForFunction(
    (initial) => getComputedStyle(document.body).backgroundColor !== initial,
    before,
  );
  const after = await bg();
  assert.notEqual(before, after, "Theme toggle changes the palette");
  await desktop.goto(baseURL + "/work/resumeiq.html");
  assert.equal(await bg(), after, "Theme persists across pages");
  await desktop.evaluate(() => localStorage.removeItem("theme"));

  // Case-study page links back home and to the next study.
  await desktop.getByRole("link", { name: /Bank Marketing Intelligence/ }).last().click();
  await desktop.waitForURL(/bank-marketing-intelligence/);
  await desktop.getByRole("link", { name: /All work/ }).click();
  await desktop.waitForURL(/index\.html#projects/);
  results.push({ desktop: "nav, filter, citation reset, preview, annotations, theme, page links" });

  // 3. Mobile menu, keyboard and focus.
  const mobile = await browser.newPage({ viewport: { width: 375, height: 800 }, reducedMotion: "reduce" });
  watch(mobile, errors);
  await mobile.goto(baseURL);
  assert.equal(await mobile.locator("#navMenu").isVisible(), false);
  await mobile.getByRole("button", { name: "Menu" }).click();
  assert.equal(await mobile.locator("#navMenu").isVisible(), true);
  await mobile.getByRole("navigation").getByRole("link", { name: /Experience/ }).click();
  assert.equal(await mobile.locator("#menuToggle").getAttribute("aria-expanded"), "false");
  assert.equal(await mobile.locator("#experience").evaluate((e) => document.activeElement === e), true);
  await mobile.getByRole("button", { name: "Menu" }).click();
  await mobile.keyboard.press("Escape");
  assert.equal(await mobile.locator("#menuToggle").evaluate((e) => document.activeElement === e), true);
  assert.equal(await mobile.locator("#navMenu").isVisible(), false);
  // Touch devices get no hover preview.
  assert.equal(await mobile.locator(".preview").isVisible(), false);

  await mobile.goto(baseURL);
  await mobile.keyboard.press("Tab");
  assert.equal(await mobile.locator(".skip-link").evaluate((e) => document.activeElement === e), true);
  await mobile.keyboard.press("Enter");
  assert.equal(await mobile.locator("main").evaluate((e) => document.activeElement === e), true);

  const [download] = await Promise.all([
    mobile.waitForEvent("download"),
    mobile.getByRole("link", { name: /Download Resume/ }).click(),
  ]);
  assert.equal(download.suggestedFilename(), "Iqra-Nawaz-Resume.pdf");
  assert.equal(await download.failure(), null);
  assert.equal(await mobile.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");

  // Resize from mobile to desktop restores the inline navigation.
  await mobile.getByRole("button", { name: "Menu" }).click();
  await mobile.setViewportSize({ width: 1280, height: 900 });
  await mobile.waitForFunction(() => document.querySelector("#menuToggle").hidden);
  assert.equal(await mobile.locator("#navMenu").isVisible(), true);
  results.push({ mobile: "menu, Escape, focus, skip link, resume download, resize" });

  // 4. Reduced motion: reveals are visible immediately and nothing animates.
  const still = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await still.goto(baseURL);
  assert.equal(await still.locator(".reveal").first().evaluate((e) => getComputedStyle(e).opacity), "1");

  // Proof numbers show final values and the citation demo steps manually under reduced motion.
  assert.deepEqual(await still.locator(".count").allTextContents(), ["9", "326", "92"]);
  assert.match(await still.locator(".cd-verdict").textContent(), /Quotation matched/);
  await still.getByRole("button", { name: "Next example" }).click();
  assert.match(await still.locator(".cd-verdict").textContent(), /Not in source/);

  // With motion: numbers count up to their targets and the demo plays and pauses.
  const moving = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  watch(moving, errors);
  await moving.goto(baseURL);
  await moving.waitForFunction(() => [...document.querySelectorAll(".count")].map((e) => e.textContent).join() === "9,326,92");
  await moving.waitForFunction(() => document.querySelector(".cd-verdict").classList.contains("is-pass"), null, { timeout: 15000 });
  await moving.getByRole("button", { name: "Pause" }).click();
  // AUC bars start collapsed and grow to full width once the chart is on screen.
  const barScale = () => moving.locator(".model-chart .is-selected .bar").evaluate((e) => getComputedStyle(e).transform);
  assert.match(await barScale(), /^matrix\(0,/);
  await moving.locator(".model-chart").scrollIntoViewIfNeeded();
  await moving.waitForFunction(() => getComputedStyle(document.querySelector(".model-chart .is-selected .bar")).transform.startsWith("matrix(1,"));
  assert.equal(await moving.getByRole("button", { name: "Play" }).getAttribute("aria-pressed"), "true");
  await moving.close();
  results.push({ hero: "count-up, citation demo pass/fail, pause, reduced-motion stepping" });

  // 5. Without JavaScript everything is readable and the filter is not offered.
  const noJS = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  await noJS.goto(baseURL);
  assert.equal(await noJS.locator("#navMenu").isVisible(), true);
  assert.equal(await noJS.locator(".filters").isVisible(), false);
  assert.equal(await noJS.locator(".archive__row:visible").count(), await noJS.locator(".archive__row").count());
  assert.equal(await noJS.locator("#deeptrace-project").isVisible(), true);
  await noJS.close();

  // 6. Unknown routes return 404 with the styled not-found page.
  const lost = await browser.newPage();
  const response = await lost.goto(`${baseURL}/missing/deeper/page`);
  assert.equal(response.status(), 404);
  assert.match(await lost.locator("h1").textContent(), /isn’t in the/);
  assert.notEqual(await lost.evaluate(() => getComputedStyle(document.body).fontFamily), "");
  assert.equal(await lost.evaluate(() => getComputedStyle(document.body).backgroundColor) === "rgba(0, 0, 0, 0)", false);
  results.push({ extras: "reduced motion, no-JS, styled 404" });

  assert.deepEqual(errors, [], "No console errors, page errors or failed requests");
  fs.writeFileSync(path.join(outputDir, "browser-results.json"), JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors }, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
