# QA report — v3 (fixes, hero proof, case studies, toolkit tags, palette, polish)

Date: 12 November 2026. All runs against the local production build (`npm run build && npm start`),
which serves the same files GitHub Pages does and now gzips text assets like GitHub Pages.
github.io itself was not reachable from the build environment.

## Lighthouse 12.2.1 (Performance / Accessibility / Best Practices / SEO)

| Page | Before (mobile) | After (mobile) | Before (desktop) | After (desktop) |
|---|---|---|---|---|
| Home | 94 / 100 / 100 / 100 | 97–99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| DeepTrace AI case study | — | 99 / 100 / 100 / 100 | — | 100 / 100 / 100 / 100 |
| ResumeIQ case study | — | 98 / 100 / 100 / 100 | — | 100 / 100 / 100 / 100 |
| Bank Marketing case study | — | 99 / 100 / 100 / 100 | — | 100 / 100 / 100 / 100 |

Home mobile: first contentful paint 2.1 s → 1.2 s; cumulative layout shift 0.001. Mobile
performance varies by 1–3 points between runs.

## Automated checks

| Check | Result |
|---|---|
| `npm run check` | OK |
| `npm test` | 20 passing: manifest, every local link/anchor/asset, safe external links, single email, structure and alt text, facts and limitations, filter chips, nav numbering, hidden TODO slots, proof numbers and source, featured-project problem lines / retrospectives / clip slots, Try it live, skill usage tags, testimonial slot, palette button, social meta tags, legacy anchors |
| `npm run test:browser` | 4 pages × 8 widths (320–1920 px): no overflow, images decode, 0 console errors or failed requests. Nav incl. Education highlight, archive filters incl. LLM and citation-reset, hover preview, annotations, copy-email with "Copied" feedback, count-up, citation demo pass/fail/pause, reduced-motion stepping, AUC bars growing on scroll, command palette (shortcut, search, Enter, empty state, Escape focus return), theme persisting across pages, mobile menu/Escape/focus, skip link, resume download, resize, no-JS, styled 404 |
| axe-core 4.10.3 | 0 violations on all 5 pages × light/dark × 390/1440 px, and with the command palette open |
| 360 px audit | No page-level or inner horizontal scrolling on any page; every image has alt text; no lazy images above the fold |
| External links | Every GitHub target verified to exist on `main` via git and the GitHub API. Streamlit and LinkedIn could not be reached from the build environment; check them in a browser. |
