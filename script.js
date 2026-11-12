"use strict";
// Progressive enhancement only: every section, link and project is usable without JavaScript.

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* Mobile menu ------------------------------------------------------------ */
const menuToggle = $("#menuToggle");
const navMenu = $("#navMenu");
const mobile = window.matchMedia("(max-width: 960px)");
const navLinks = $$(".nav__link");

function setMenu(open, returnFocus = false) {
  if (!menuToggle || !navMenu) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "Close" : "Menu";
  navMenu.hidden = mobile.matches && !open;
  if (returnFocus) menuToggle.focus({ preventScroll: true });
}
function syncMenu() {
  if (!menuToggle || !navMenu) return;
  const focusWillHide = mobile.matches && navMenu.contains(document.activeElement);
  menuToggle.hidden = !mobile.matches;
  setMenu(false, focusWillHide);
}
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () =>
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true"),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobile.matches && !navMenu.hidden) setMenu(false, true);
  });
  document.addEventListener("click", (event) => {
    if (mobile.matches && !navMenu.hidden && !event.target.closest(".masthead")) setMenu(false);
  });
  mobile.addEventListener("change", syncMenu);
  syncMenu();
}

/* Archive filter ---------------------------------------------------------- */
const filters = $(".filters");
const rows = $$(".archive__row");
const filterStatus = $(".filter-status");
function applyFilter(filter) {
  let shown = 0;
  for (const row of rows) {
    const match = filter === "all" || row.dataset.category.split(" ").includes(filter);
    row.hidden = !match;
    if (match) shown += 1;
  }
  $$("button", filters).forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.filter === filter)),
  );
  if (filterStatus) filterStatus.textContent = `${shown} project${shown === 1 ? "" : "s"}`;
}
if (filters && rows.length) {
  filters.hidden = false;
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (button) applyFilter(button.dataset.filter);
  });
}

// In-page links move keyboard focus with the scroll, and un-filter a hidden target.
document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.hash.length < 2) return;
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  if (link.classList.contains("nav__link")) setMenu(false);
  if (filters && target.matches(".archive__row[hidden]")) applyFilter("all");
  if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
  requestAnimationFrame(() => target.focus({ preventScroll: true }));
});

/* Active section in the navigation --------------------------------------- */
const sections = navLinks
  .map((link) => document.getElementById(link.hash.slice(1)))
  .filter(Boolean);
let pending = false;
function updateActiveSection() {
  pending = false;
  if (!sections.length) return;
  const marker = ($(".masthead")?.offsetHeight || 0) + 120;
  let current = null;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= marker) current = section.id;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4)
    current = sections[sections.length - 1].id;
  navLinks.forEach((link) => {
    if (current && link.hash === `#${current}`) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
function requestUpdate() {
  if (!pending) {
    pending = true;
    requestAnimationFrame(updateActiveSection);
  }
}
window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", requestUpdate);
updateActiveSection();

/* Theme toggle: follows the system until the visitor chooses -------------- */
const themeToggle = $("#themeToggle");
if (themeToggle) {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const current = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");
  const label = () =>
    themeToggle.setAttribute(
      "aria-label",
      `Switch to ${current() === "dark" ? "light" : "dark"} theme`,
    );
  themeToggle.hidden = false;
  label();
  systemDark.addEventListener("change", label);
  themeToggle.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    label();
  });
}

/* Archive hover preview: mouse/trackpad only, purely decorative ---------- */
const preview = $(".preview");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
if (preview && finePointer.matches) {
  const img = $("img", preview);
  let frame = 0;
  for (const row of rows.filter((r) => r.dataset.preview)) {
    row.addEventListener("pointerenter", () => {
      img.src = row.dataset.preview;
      preview.classList.add("is-visible");
    });
    row.addEventListener("pointerleave", () => preview.classList.remove("is-visible"));
    row.addEventListener("pointermove", (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = Math.min(event.clientX + 24, window.innerWidth - preview.offsetWidth - 16);
        const y = Math.min(event.clientY + 16, window.innerHeight - preview.offsetHeight - 16);
        preview.style.setProperty("--px", `${x}px`);
        preview.style.setProperty("--py", `${y}px`);
      });
    });
  }
}

/* Annotated screenshots: hovering a note highlights its pin, and vice versa */
for (const figure of $$("[data-annotated]")) {
  const scope = figure.closest("figure") || figure;
  const notes = $$("li[data-note]", scope);
  const pins = $$(".pin", figure);
  const highlight = (id) => {
    figure.classList.toggle("is-pointing", Boolean(id));
    pins.forEach((p) => p.classList.toggle("is-active", p.dataset.note === id));
    notes.forEach((n) => n.classList.toggle("is-active", n.dataset.note === id));
  };
  for (const el of [...notes, ...pins]) {
    el.addEventListener("pointerenter", () => highlight(el.dataset.note));
    el.addEventListener("pointerleave", () => highlight(null));
  }
}

/* One quiet reveal as sections enter the viewport ------------------------ */
const reveals = $$(".reveal");
if (reveals.length && "IntersectionObserver" in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
}

const year = $("#currentYear");
if (year) year.textContent = new Date().getFullYear();

/* Copy email to clipboard, with visible and announced feedback ------------ */
for (const button of $$(".copy-btn")) {
  const label = $(".copy-btn__label", button);
  const status = button.parentElement.querySelector(".copy-status");
  let timer = 0;
  button.hidden = false;
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      // Fallback for browsers without the async clipboard API.
      const field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      try {
        ok = document.execCommand("copy");
      } catch {}
      field.remove();
    }
    label.textContent = ok ? "Copied" : "Copy";
    button.classList.toggle("is-copied", ok);
    if (status) status.textContent = ok ? "Email address copied" : "Copy failed — select the address instead";
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = "Copy";
      button.classList.remove("is-copied");
      if (status) status.textContent = "";
    }, 2200);
  });
}

/* Count-up for proof numbers when they scroll into view ------------------ */
const counters = $$(".count[data-count]");
if (counters.length && "IntersectionObserver" in window && !reduceMotion.matches) {
  const animate = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        countObserver.unobserve(entry.target);
        animate(entry.target);
      }
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => {
    el.textContent = "0";
    countObserver.observe(el);
  });
}

/* Citation demo: a real quotation check on sentences from the DeepTrace README */
const citeDemo = $("[data-cite-demo]");
if (citeDemo) {
  const examples = [
    {
      claim: "DeepTrace never lets the model pick which pages to read.",
      quote: "never chooses a URL",
      source: "The model has no tools and never chooses a URL.",
    },
    {
      claim: "Every claim DeepTrace cites is guaranteed to be true.",
      quote: "guaranteed to be true",
      source:
        "The interface says plainly that a valid citation shows the source says those words, not that the claim is true.",
    },
    {
      claim: "DeepTrace respects what websites allow crawlers to read.",
      quote: "robots.txt is followed",
      source: "robots.txt is followed (RFC 9309).",
    },
  ];
  const el = {
    claim: $(".cd-claim", citeDemo),
    quote: $(".cd-quote", citeDemo),
    source: $(".cd-source", citeDemo),
    verdict: $(".cd-verdict", citeDemo),
    toggle: $(".cd-toggle", citeDemo),
  };
  const normalise = (text) => text.toLowerCase().replace(/\s+/g, " ").trim();
  const check = (quote, source) => normalise(source).indexOf(normalise(quote));
  let index = 0;
  let paused = false;
  let timer = 0;
  let running = false;

  function setVerdict(state, text) {
    el.verdict.className = `cd-verdict is-${state}`;
    el.verdict.textContent = "";
    if (state !== "checking") {
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = state === "pass" ? "✓ " : "✗ ";
      el.verdict.append(icon);
    }
    el.verdict.append(text);
  }
  function renderSource(example, highlight) {
    el.source.textContent = "";
    const at = check(example.quote, example.source);
    if (!highlight || at < 0) {
      el.source.textContent = example.source;
      return;
    }
    const mark = document.createElement("mark");
    mark.textContent = example.source.slice(at, at + example.quote.length);
    el.source.append(example.source.slice(0, at), mark, example.source.slice(at + example.quote.length));
  }
  function showFinal(example) {
    el.claim.textContent = example.claim;
    el.quote.textContent = `“${example.quote}”`;
    renderSource(example, true);
    const found = check(example.quote, example.source) >= 0;
    setVerdict(found ? "pass" : "fail", found ? "Quotation matched" : "Not in source — citation suppressed");
  }
  const wait = (ms) =>
    new Promise((resolve) => {
      timer = setTimeout(resolve, ms);
    });
  async function waitWhilePaused() {
    while (paused) await wait(200);
  }
  async function type(target, text) {
    target.textContent = "";
    target.classList.add("cd-caret");
    for (let i = 1; i <= text.length; i += 1) {
      await waitWhilePaused();
      target.textContent = text.slice(0, i);
      await wait(22);
    }
    target.classList.remove("cd-caret");
  }
  async function loop() {
    if (running) return;
    running = true;
    for (;;) {
      const example = examples[index];
      el.source.textContent = example.source;
      el.quote.textContent = "";
      setVerdict("checking", "Waiting for a claim…");
      await type(el.claim, example.claim);
      await wait(350);
      await type(el.quote, `“${example.quote}”`);
      await waitWhilePaused();
      setVerdict("checking", "Checking the saved source…");
      await wait(700);
      await waitWhilePaused();
      showFinal(example);
      await wait(3200);
      await waitWhilePaused();
      index = (index + 1) % examples.length;
    }
  }

  el.toggle.hidden = false;
  if (reduceMotion.matches) {
    // No autoplay: show a finished check and let the visitor step through examples.
    el.toggle.textContent = "Next example";
    el.toggle.removeAttribute("aria-pressed");
    el.verdict.setAttribute("aria-live", "polite");
    showFinal(examples[index]);
    el.toggle.addEventListener("click", () => {
      index = (index + 1) % examples.length;
      showFinal(examples[index]);
    });
  } else {
    el.toggle.addEventListener("click", () => {
      paused = !paused;
      el.toggle.textContent = paused ? "Play" : "Pause";
      el.toggle.setAttribute("aria-pressed", String(paused));
    });
    // Start only once the demo is on screen.
    const demoObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        demoObserver.disconnect();
        loop();
      }
    });
    demoObserver.observe(citeDemo);
  }
}

/* Looping demo clips: load lazily, play only while visible, respect reduced motion */
const clips = $$("video.loop");
if (clips.length) {
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    clips.forEach((video) => {
      video.controls = true;
    });
  } else {
    const clipObserver = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) target.play().catch(() => (target.controls = true));
          else target.pause();
        }
      },
      { threshold: 0.35 },
    );
    clips.forEach((video) => clipObserver.observe(video));
  }
}

/* Command palette: Ctrl/Cmd+K jumps to any section, project or action ----- */
const paletteOpen = $("#paletteOpen");
if (paletteOpen && typeof HTMLDialogElement === "function") {
  const inWork = /\/work\//.test(location.pathname);
  const home = inWork ? "../index.html" : "";
  const page = (file) => (inWork ? file : `work/${file}`);
  const items = [
    { group: "Sections", label: "Selected work", hint: "IN·01", href: `${home}#projects` },
    { group: "Sections", label: "Currently building", hint: "In the lab", href: `${home}#now` },
    { group: "Sections", label: "Archive", hint: "IN·02", href: `${home}#archive` },
    { group: "Sections", label: "About", hint: "IN·03", href: `${home}#about` },
    { group: "Sections", label: "Experience", hint: "IN·04", href: `${home}#experience` },
    { group: "Sections", label: "Toolkit", hint: "IN·05", href: `${home}#skills` },
    { group: "Sections", label: "Education & certifications", hint: "IN·06", href: `${home}#education` },
    { group: "Sections", label: "Contact", hint: "IN·07", href: `${home}#contact` },
    { group: "Case studies", label: "DeepTrace AI — case study", hint: "01", href: page("deeptrace-ai.html"), keys: "rag citations llm" },
    { group: "Case studies", label: "ResumeIQ — case study", hint: "02", href: page("resumeiq.html"), keys: "nlp fastapi react" },
    { group: "Case studies", label: "Bank Marketing Intelligence — case study", hint: "03", href: page("bank-marketing-intelligence.html"), keys: "xgboost ml" },
    { group: "Projects", label: "DeepTrace AI", hint: "Featured", href: `${home}#deeptrace-project` },
    { group: "Projects", label: "ResumeIQ", hint: "Featured", href: `${home}#resumeiq-project` },
    { group: "Projects", label: "Bank Marketing Intelligence", hint: "Featured · live", href: `${home}#bank-project` },
    { group: "Projects", label: "Smart Screenshot Organizer", hint: "Field note", href: `${home}#screenshot-project`, keys: "ocr" },
    { group: "Projects", label: "SQL Data Warehouse & Analytics", hint: "A01", href: `${home}#warehouse-project`, keys: "etl" },
    { group: "Projects", label: "SentixAI — Review Sentiment", hint: "A02", href: `${home}#sentix-project`, keys: "nlp" },
    { group: "Projects", label: "LeafGuard AI", hint: "A03", href: `${home}#leafguard-project`, keys: "cnn vision" },
    { group: "Projects", label: "CineMatch — Movie Recommender", hint: "A04 · live", href: `${home}#cinematch-project` },
    { group: "Projects", label: "Automated Data Pipeline", hint: "A05 · FYP", href: `${home}#pipeline-project` },
    { group: "Projects", label: "RouteWise — NED Route Finder", hint: "A06", href: `${home}#routewise-project` },
    { group: "Projects", label: "Shopify Product Management API", hint: "A07", href: `${home}#shopify-project` },
    { group: "Projects", label: "AI-Based Medicine Recommendation", hint: "In development", href: `${home}#medicine-project` },
    { group: "Actions", label: "Download resume (PDF)", hint: "PDF", href: `${inWork ? "../" : ""}assets/Iqra-Nawaz-Resume.pdf`, download: "Iqra-Nawaz-Resume.pdf" },
    { group: "Actions", label: "Switch colour theme", hint: "Light / dark", action: () => themeToggle?.click() },
    { group: "Actions", label: "Open GitHub profile", hint: "New tab", href: "https://github.com/Iqranawaz-debug", external: true },
  ].filter((item) => !item.action || themeToggle);

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $(".palette-btn__kbd", paletteOpen).textContent = isMac ? "⌘K" : "Ctrl K";
  paletteOpen.hidden = false;

  const dialog = document.createElement("dialog");
  dialog.className = "palette";
  dialog.setAttribute("aria-label", "Jump to a section, project or action");
  dialog.innerHTML = `
    <div class="palette__box">
      <label class="sr-only" for="paletteInput">Search sections, projects and actions</label>
      <input id="paletteInput" class="palette__input" type="text" autocomplete="off" spellcheck="false"
        placeholder="Jump to…" role="combobox" aria-expanded="true" aria-controls="paletteList" aria-autocomplete="list" />
      <ul id="paletteList" class="palette__list" role="listbox" aria-label="Results"></ul>
      <p class="palette__empty" hidden>No matches. Try “case study”, “live” or a project name.</p>
      <p class="palette__help" aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd> move · <kbd>Enter</kbd> go · <kbd>Esc</kbd> close</p>
    </div>`;
  document.body.append(dialog);
  const input = $(".palette__input", dialog);
  const list = $(".palette__list", dialog);
  const empty = $(".palette__empty", dialog);
  let results = items;
  let active = 0;
  let opener = null;

  function render() {
    const q = input.value.trim().toLowerCase();
    results = items.filter((item) =>
      q.split(/\s+/).every((word) => `${item.label} ${item.hint} ${item.group} ${item.keys || ""}`.toLowerCase().includes(word)),
    );
    active = Math.min(active, Math.max(0, results.length - 1));
    list.textContent = "";
    let lastGroup = "";
    results.forEach((item, i) => {
      if (item.group !== lastGroup) {
        const heading = document.createElement("li");
        heading.className = "palette__group";
        heading.setAttribute("role", "presentation");
        heading.textContent = item.group;
        list.append(heading);
        lastGroup = item.group;
      }
      const option = document.createElement("li");
      option.id = `palette-opt-${i}`;
      option.className = "palette__option";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(i === active));
      const label = document.createElement("span");
      label.textContent = item.label;
      const hint = document.createElement("span");
      hint.className = "palette__hint";
      hint.textContent = item.hint;
      option.append(label, hint);
      option.addEventListener("click", () => choose(i));
      option.addEventListener("pointermove", () => {
        if (active !== i) {
          active = i;
          highlight();
        }
      });
      list.append(option);
    });
    empty.hidden = results.length > 0;
    highlight();
  }
  function highlight() {
    $$(".palette__option", list).forEach((el, i) => el.setAttribute("aria-selected", String(i === active)));
    const current = $(`#palette-opt-${active}`, list);
    if (current) {
      input.setAttribute("aria-activedescendant", current.id);
      current.scrollIntoView({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  }
  function open() {
    if (dialog.open) return;
    opener = document.activeElement;
    input.value = "";
    active = 0;
    render();
    dialog.showModal();
    input.focus();
  }
  function close() {
    if (dialog.open) dialog.close();
  }
  function choose(i) {
    const item = results[i];
    if (!item) return;
    opener = null; // focus moves to the destination instead
    close();
    if (item.action) return item.action();
    if (item.download || item.external) {
      const a = document.createElement("a");
      a.href = item.href;
      if (item.download) a.download = item.download;
      if (item.external) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      a.click();
      return;
    }
    const [path, hash] = item.href.split("#");
    if (!path && hash) {
      const target = document.getElementById(hash);
      if (target) {
        if (filters && target.matches(".archive__row[hidden]")) applyFilter("all");
        history.pushState(null, "", `#${hash}`);
        if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
        target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
        target.focus({ preventScroll: true });
        return;
      }
    }
    location.href = item.href;
  }

  input.addEventListener("input", () => {
    active = 0;
    render();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!results.length) return;
      active = (active + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      highlight();
    } else if (event.key === "Home" || event.key === "End") {
      if (!results.length) return;
      event.preventDefault();
      active = event.key === "Home" ? 0 : results.length - 1;
      highlight();
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(active);
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close(); // click on the backdrop
  });
  dialog.addEventListener("close", () => {
    if (opener && document.contains(opener)) opener.focus();
  });
  paletteOpen.addEventListener("click", open);
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (dialog.open) close();
      else open();
    }
  });
}

/* Scroll reveal for more of the page (enhancement only) ------------------- */
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const extra = $$(".section-head, .timeline > li, .toolkit > li, .principles > li, .building__card, .education > *, .fieldnote, .archive")
    .filter((el) => !el.classList.contains("reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -6% 0px" },
  );
  const setup = () => {
    // Read every position first, then write: interleaving forces a layout per element.
    const fold = window.innerHeight;
    const below = extra.filter((el) => el.getBoundingClientRect().top >= fold);
    below.forEach((el, i) => {
      // Only animate what starts below the fold, so nothing visible on load jumps.
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${(i % 3) * 70}ms`);
      io.observe(el);
    });
  };
  if ("requestIdleCallback" in window) requestIdleCallback(setup, { timeout: 800 });
  else setTimeout(setup, 200);
}

/* Draft mode: ?draft outlines every TODO slot so missing content is easy to find */
if (new URLSearchParams(location.search).has("draft")) document.documentElement.classList.add("draft");
