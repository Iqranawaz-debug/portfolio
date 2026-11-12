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

/* Draft mode: ?draft outlines every TODO slot so missing content is easy to find */
if (new URLSearchParams(location.search).has("draft")) document.documentElement.classList.add("draft");
