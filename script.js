"use strict";

// Enhance the existing semantic page; all content and links work without JS.
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const mobile = window.matchMedia("(max-width: 900px)");
const navLinks = [...document.querySelectorAll(".nav-link")];

function setMenu(open, returnFocus = false) {
  menuToggle.setAttribute("aria-expanded", String(open));
  navMenu.hidden = mobile.matches && !open;
  if (returnFocus) menuToggle.focus({ preventScroll: true });
}

function syncMenu() {
  const focusWillHide =
    mobile.matches && navMenu.contains(document.activeElement);
  menuToggle.hidden = !mobile.matches;
  setMenu(false, focusWillHide);
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobile.matches && !navMenu.hidden)
    setMenu(false, true);
});
document.addEventListener("click", (event) => {
  if (mobile.matches && !navMenu.hidden && !event.target.closest(".navbar"))
    setMenu(false);
});
navLinks.forEach((link) =>
  link.addEventListener("click", () => {
    setMenu(false);
    // Move keyboard focus with the anchor, rather than leaving it in hidden navigation.
    const target = document.querySelector(link.hash);
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }),
);
mobile.addEventListener("change", syncMenu);
syncMenu();

document.getElementById("currentYear").textContent = new Date().getFullYear();

// Resolve the current section once per animation frame, including tall sections.
const sections = [...document.querySelectorAll("main > section[id]")];
let pending = false;
function updateActiveSection() {
  const marker = document.querySelector(".navbar").offsetHeight + 100;
  let current = sections[0].id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= marker) current = section.id;
  }
  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 4
  ) {
    current = sections[sections.length - 1].id;
  }
  navLinks.forEach((link) => {
    if (link.hash === `#${current}`)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  pending = false;
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

// Project filters: progressive enhancement; without JS every project stays visible.
const filterGroup = document.querySelector(".project-filters");
if (filterGroup) {
  const cards = [...document.querySelectorAll(".mini-card")];
  const buttons = [...filterGroup.querySelectorAll("button")];
  const status = document.querySelector(".filter-status");
  filterGroup.hidden = false;
  filterGroup.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    const filter = button.dataset.filter;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    let shown = 0;
    for (const card of cards) {
      const match =
        filter === "all" || card.dataset.category.split(" ").includes(filter);
      card.hidden = !match;
      if (match) shown += 1;
    }
    if (status)
      status.textContent = `Showing ${shown} project${shown === 1 ? "" : "s"}`;
  });
  // Links to a filtered-out project (e.g. from the skills section) reset the filter.
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    const target = link && document.getElementById(link.hash.slice(1));
    if (target && target.matches(".mini-card[hidden]")) buttons[0].click();
  });
}
