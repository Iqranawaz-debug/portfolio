import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { pages, siteFiles } from "../tools/site-files.mjs";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");
// HTML comments hold TODO templates for content not supplied yet; they are not rendered, so skip them.
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, "");
const docs = Object.fromEntries(
  await Promise.all(pages.map(async (p) => [p, stripComments(await read(p))])),
);
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
    "86.4% accuracy and 0.614 macro-F1 on 4,500 held-out reviews",
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

test("hero proof numbers match the DeepTrace closure report and link to it", () => {
  for (const [n] of [["9"], ["326"], ["92"]]) assert.match(home, new RegExp(`data-count="${n}">${n}<`));
  assert.match(home, /DeepTrace-AI\/blob\/main\/docs\/PROJECT_CLOSURE\.md/);
});

test("each featured project has a problem line, a 'do differently' note and a clip slot", () => {
  for (const id of ["deeptrace-project", "resumeiq-project", "bank-project", "screenshot-project"]) {
    const start = home.indexOf(`id="${id}"`);
    const block = home.slice(start, home.indexOf("</article>", start));
    assert.match(block, /class="problem-line"/, `${id}: problem line`);
    assert.match(block, /What I’d do differently/, `${id}: differently note`);
    assert.match(block, /class="media-slot"[^>]*hidden/, `${id}: hidden clip slot`);
  }
  for (const page of ["work/deeptrace-ai.html", "work/resumeiq.html", "work/bank-marketing-intelligence.html"]) {
    assert.match(docs[page], /What I’d do differently/, `${page}: differently chapter`);
    assert.match(docs[page], /Where every number comes from/, `${page}: sources`);
  }
});

test("Bank Marketing has a prominent Try it live link to the Streamlit app", () => {
  for (const html of [home, docs["work/bank-marketing-intelligence.html"]])
    assert.match(html, /class="try-live[^"]*" href="https:\/\/bank-marketing-intelligence-[\w-]+\.streamlit\.app\/"/);
});

test("every toolkit skill is tagged with how it was used, with no proficiency bars", () => {
  const skills = [...home.matchAll(/<ul class="skills"[\s\S]*?<\/ul>/g)].flatMap((m) => [...m[0].matchAll(/<li>[\s\S]*?<\/li>/g)].map((x) => x[0]));
  assert.ok(skills.length >= 30, `found ${skills.length} skills`);
  for (const li of skills) assert.match(li, /class="tag tag--(prod|proj|learn)"[\s\S]*\((used in production|used in projects|learning)\)/, li);
  assert.ok(!/progress|proficiency-bar|role="meter"/.test(home));
});

test("testimonial slot exists but stays hidden until filled", () => {
  assert.match(home, /<figure class="testimonial"[^>]*hidden/);
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
