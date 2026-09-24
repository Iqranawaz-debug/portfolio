# Portfolio implementation and verification

Date: 24 September 2026

## Changes

Retained the static HTML/CSS/JavaScript architecture, original portrait, and navy/blue palette. Replaced obsolete content with the supplied current profile and cross-checked it against the supplied CV. Added four project case studies, grouped skills, current experience, education, certifications, engineering workflow, metadata, favicon, and a genuine email action. Added verified GitHub profile/project links and a download of the original DOCX CV.

Removed invalid Markdown fences in HTML, placeholder social links, fabricated contact-form success behavior, debug logging, skill percentages, continuous animations, duplicated styles, and external font/icon dependencies. Improved mobile navigation, focus handling, active-section tracking, reduced-motion behavior, semantic landmarks, and small-screen layouts.

The pre-existing Git staging state was preserved. No commit, push, or deployment was performed. Original certificate and project-image assets remain in the source folder. Production builds include only the six required public assets, including the CV.

## Checks

- `npm.cmd run check`: JavaScript and tooling syntax passed.
- `npm.cmd test`: 3 regression tests passed: local assets/anchors, contact/external-link attributes, and essential factual content/semantics.
- `npm.cmd run build`: succeeded; production assets generated in `dist/`.
- Playwright with headless Microsoft Edge: 320, 375, 430, 768, 1024, 1280, 1440, and 1920px widths. No horizontal overflow or runtime/console errors. Mobile menu, Escape/focus return, navigation, active section, case-study expansion, resize behavior, skip link, reduced motion, missing-route response, no-JavaScript content, and CV download passed.
- Axe-core 4.10.3: no automatic WCAG A/AA or best-practice violations at 320, 768, and 1440px. Manual-review items were decorative symbols, diagram backgrounds, and the portrait caption. Desktop and mobile screenshots were visually inspected. Automated checks do not establish complete accessibility conformance.
- GitHub profile and both linked project repositories returned HTTP 200. LinkedIn returned HTTP 999, preventing automated verification; the user-supplied address was retained. Email links were checked for consistent addresses; no message was sent.
- The downloadable CV has the same SHA-256 hash as the supplied original. Content extraction confirmed consistency. Document layout rendering was unavailable because the packaged renderer could not find LibreOffice; the original DOCX was not modified or converted.

## Remaining information

No verified medicine-project repository, live project demo URLs, or production domain was provided. The public FYP repository has no README establishing its match to the supplied revised project description, so no speculative project link was added. Once a domain is chosen, add canonical and Open Graph URLs, a social preview image URL, and a sitemap. Existing certificates were retained without claiming their files verify the supplied dates.
