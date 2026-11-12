import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { pages, siteFiles } from "../tools/site-files.mjs";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");
const docs = Object.fromEntries(await Promise.all(pages.map(async (p) => [p, await read(p)])));
const home = docs["index.html"];
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const idsOf = (html) => [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);

test("every file in the deploy manifest exists", async () => {
  for (const file of siteFiles) await access(new URL(file, root));
});

test("every local link and asset resolves, and ships in the manifest", async () => {
  for (const [page, html] of Object.entries(docs)) {
    if (page === "404.html") continue; // uses a runtime base URL; checked separately
    const ids = idsOf(html);
    assert.equal(ids.length, new Set(ids).size, `${page}: IDs must be unique`);
    const base = new URL(page, root);
    for (const [, value] of html.matchAll(/(?:href|src|data-preview)="([^"]*)"/g)) {
      assert.ok(value && value !== "#", `${page}: empty or placeholder link`);
      if (/^(https:|mailto:)/.test(value)) continue;
      const [path, hash] = value.split("#");
      if (!path) {
        assert.ok(ids.includes(hash), `${page}: missing anchor #${hash}`);
        continue;
      }
      const target = new URL(path, base);
      await access(target);
      const rel = target.pathname.slice(new URL(root).pathname.length);
      assert.ok(siteFiles.includes(rel), `${page}: ${rel} is not in tools/site-files.mjs`);
      if (hash) assert.ok(idsOf(docs[rel] || "").includes(hash), `${page}: missing ${value}`);
    }
  }
});

test("the 404 page loads its assets from the site root", () => {
  const html = docs["404.html"];
  assert.match(html, /"\/portfolio\/"/);
  assert.match(html, /root \+ "style\.css"/);
  assert.ok(!/<link rel="stylesheet" href="style\.css"/.test(html), "no relative stylesheet");
});

test("external links are safe and the contact address is consistent", () => {
  for (const [page, html] of Object.entries(docs)) {
    for (const [tag] of html.matchAll(/<a\b[^>]*>/g)) {
      if (tag.includes('target="_blank"'))
        assert.match(tag, /rel="noopener noreferrer"/, `${page}: ${tag}`);
    }
    const emails = [...html.matchAll(/href="mailto:([^"]+)"/g)].map((m) => m[1]);
    for (const email of emails) assert.equal(email, "iqranawaz9353@gmail.com");
    // The address is shown once on the whole site: in the homepage contact block.
    assert.equal(emails.length, page === "index.html" ? 1 : 0, `${page}: email shown once`);
  }
});

test("pages are accessible by structure", () => {
  for (const [page, html] of Object.entries(docs)) {
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${page}: exactly one h1`);
    assert.match(html, /<main\b/, `${page}: has main`);
    assert.match(html, /<html lang="en">/, `${page}: has lang`);
    assert.ok(!html.includes("<form"), `${page}: no unconnected form`);
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      if (tag.includes('alt=""')) continue; // decorative preview image
      assert.match(tag, /alt="[^"]{8,}"/, `${page}: ${tag}`);
      assert.match(tag, /width="\d+"/, `${page}: ${tag}`);
      assert.match(tag, /height="\d+"/, `${page}: ${tag}`);
    }
  }
});

test("verified facts stay on the homepage", () => {
  const visible = text(home);
  for (const fact of [
    "DeepTrace AI",
    "ResumeIQ",
    "Bank Marketing Intelligence",
    "Smart Screenshot Organizer",
    "SQL Data Warehouse",
    "9 / 9",
    "326",
    "92%",
    "0.795",
    "77.0%",
    "Arisha Salman",
    "~92% accuracy on 1,000+ reviews",
    "In development",
    "Currently building",
    "Logiciel Services",
    "Arch Technologies",
    "60+",
    "3.70",
    "2022–2026",
  ])
    assert.ok(visible.includes(fact), `Missing: ${fact}`);
});

test("honest limitations are stated next to the claims they qualify", () => {
  assert.match(text(home), /not that the claim is true/);
  assert.match(text(docs["work/deeptrace-ai.html"]), /does not prove the passage supports the claim/);
  assert.match(text(docs["work/resumeiq.html"]), /not official ATS scores/);
  assert.match(text(docs["work/bank-marketing-intelligence.html"]), /Associations, not causes/);
});

test("archive filter degrades gracefully and every row is categorised", () => {
  assert.match(home, /class="filters"[^>]*\bhidden\b/, "Filters stay hidden until JS runs");
  const filters = [...home.matchAll(/data-filter="([^"]+)"/g)].map((m) => m[1]);
  const rows = [...home.matchAll(/<li class="archive__row"[^>]*>/g)].map((m) => m[0]);
  assert.ok(rows.length >= 8);
  for (const row of rows) {
    const category = row.match(/data-category="([^"]+)"/);
    assert.ok(category, `Uncategorised row: ${row}`);
    for (const c of category[1].split(" ")) assert.ok(filters.includes(c), `Unknown ${c}`);
  }
});

test("live demos point to deployed Streamlit apps", () => {
  const demos = new Set(
    [...home.matchAll(/href="(https:\/\/[\w-]+\.streamlit\.app\/)"/g)].map((m) => m[1]),
  );
  assert.equal(demos.size, 2);
});

test("legacy anchors from the previous site still resolve", () => {
  const ids = idsOf(home);
  for (const id of [
    "home", "about", "projects", "experience", "skills", "education", "contact", "now",
    "deeptrace-project", "bank-project", "resumeiq-project", "warehouse-project",
    "sentix-project", "leafguard-project", "cinematch-project", "pipeline-project",
    "screenshot-project", "routewise-project", "shopify-project", "medicine-project",
    "logiciel-experience",
  ])
    assert.ok(ids.includes(id), `Missing legacy anchor #${id}`);
});

test("archive filter offers All, ML, LLM, Data Eng and Apps", () => {
  const labels = [...home.matchAll(/data-filter="[^"]+"[^>]*>([^<]+)</g)].map((m) => m[1]);
  assert.deepEqual(labels, ["All", "ML", "LLM", "Data Eng", "Apps"]);
  for (const f of ["ml", "llm", "data", "apps"])
    assert.ok(new RegExp(`data-category="[^"]*\\b${f}\\b`).test(home), `No row for ${f}`);
});

test("navigation numbers are consecutive and include Education", () => {
  const nums = [...home.matchAll(/class="nav__link"[^>]*><span class="num">(\d+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(nums, ["01", "02", "03", "04", "05", "06", "07"]);
  assert.match(home, /href="#education"><span class="num">06<\/span>Education/);
});

test("TODO slots stay hidden from visitors", () => {
  for (const [page, html] of Object.entries(docs))
    for (const [tag] of html.matchAll(/<[a-z]+\b[^>]*data-todo[^>]*>/g))
      assert.match(tag, /\bhidden\b/, `${page}: visible TODO slot ${tag}`);
});
