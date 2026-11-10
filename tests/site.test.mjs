import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const visibleText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

test("every local navigation link and asset resolves", async () => {
  assert.equal(ids.length, new Set(ids).size, "IDs must be unique");
  for (const [, value] of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
    assert.ok(value && value !== "#", "No empty or placeholder links");
    if (value.startsWith("#"))
      assert.ok(ids.includes(value.slice(1)), `Missing anchor: ${value}`);
    else if (!/^(https:|mailto:)/.test(value))
      await access(new URL(value, root));
  }
});
test("external links are safe and contact addresses stay consistent", () => {
  for (const [tag] of html.matchAll(/<a\b[^>]*>/g)) {
    if (tag.includes('target="_blank"'))
      assert.match(tag, /rel="noopener noreferrer"/);
  }
  const emails = [...html.matchAll(/href="mailto:([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual([...new Set(emails)], ["iqranawaz9353@gmail.com"]);
});
test("core content is available without JavaScript and factual status is retained", () => {
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.match(html, /<main\b/);
  assert.match(html, /class="skip-link"/);
  for (const text of [
    "In development",
    "DeepTrace AI",
    "Bank Marketing Intelligence",
    "ResumeIQ",
    "SQL Data Warehouse",
    "LeafGuard AI",
    "SentixAI",
    "CineMatch",
    "Smart Screenshot Organizer",
    "RouteWise",
    "Shopify Product Management API",
    "1,000+",
    "~92%",
    "Automated Data Pipeline",
    "Arch Technologies",
    "60+",
    "3.70",
    "2022–2026",
  ])
    assert.ok(visibleText.includes(text), `Missing: ${text}`);
  assert.ok(!html.includes("```"));
  assert.ok(!html.includes("<form"), "No unconnected contact form");
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(tag, /alt="[^"]+"/);
    assert.match(tag, /width="\d+"/);
    assert.match(tag, /height="\d+"/);
  }
});
test("project filters degrade gracefully and every project card is categorised", () => {
  assert.match(html, /class="project-filters"[^>]*\bhidden\b/, "Filters hidden until JS runs");
  const cards = [...html.matchAll(/<li class="mini-card"[^>]*>/g)].map((m) => m[0]);
  assert.ok(cards.length >= 6);
  const filters = [...html.matchAll(/data-filter="([^"]+)"/g)].map((m) => m[1]);
  for (const card of cards) {
    const category = card.match(/data-category="([^"]+)"/);
    assert.ok(category, `Uncategorised card: ${card}`);
    for (const c of category[1].split(" "))
      assert.ok(filters.includes(c), `Unknown category ${c}`);
  }
});
test("live demos point to deployed Streamlit apps", () => {
  const demos = [...html.matchAll(/class="project-demo"\s+href="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(demos.length, 2);
  for (const url of demos) assert.match(url, /^https:\/\/[\w-]+\.streamlit\.app\/$/);
});
