# Portfolio second-pass verification

Date: 24 September 2026

## Scope and implementation

Refined the existing static portfolio without replacing its architecture. Retained the headline, factual content, blue/navy palette, GitHub links, and “Built with ❤️ and dedication” footer.

- Kept six visible navigation links above 900px and added a separate PDF Resume CTA. Tablet/mobile retains the accessible menu.
- Reduced portrait dominance, added the Data → Model → Validate → Deploy diagram, and made availability a quiet status indicator.
- Replaced the primary DOCX download with the supplied, unchanged PDF. The original DOCX remains in source.
- Tightened About into a two-column composition with Prepare, Model, Validate, and Ship steps.
- Added structured project notes for problem, approach, technical implementation, and current outcome, using native details and progressive CSS expansion. No unsupported technologies, outcomes, or metrics were added.
- Used the existing FYP document-library screenshot with a precise caption. The preview is a 39,482-byte WebP generated from the original screenshot, lazy-loaded with explicit dimensions; clicking opens the original PNG. UI values in the screenshot are not presented as project evaluation metrics.
- Gave Logiciel Services greater visual prominence and connected toolkit skills directly to project/experience evidence.
- Reduced border density, normalized type hierarchy, made education lead with the degree, reduced CGPA prominence, and strengthened the closing contact CTA.

## Actual checks

- `npm.cmd run check`: JavaScript/tool syntax checks passed.
- `npm.cmd test`: all 3 content, local-link/asset, and safe-link/contact regression tests passed.
- `npm.cmd run build`: passed; 8 referenced public assets generated in `dist/`. The old generated DOCX is removed; the original source DOCX is preserved.
- `npm.cmd run test:browser`: passed using the available Playwright installation and headless Edge. Tests cover 320, 375, 430, 768, 1024, 1280, 1440, and 1920px, navigation, desktop link visibility, mobile menu, Escape/focus, active sections, project expansion, lazy image decoding, PDF download, skip link, reduced motion, resize behavior, no-JavaScript access, and missing routes. No horizontal overflow, runtime errors, or console errors were observed.
- Additional browser checks: PDF HTTP status 200, correct `application/pdf` response and PDF signature; keyboard Enter/Space expansion with motion enabled.
- Axe-core 4.10.3: zero automatic WCAG A/AA and best-practice violations at 320, 768, and 1440px. Gradient areas were additionally checked against their lightest background colors with no contrast violations. Decorative symbols and translucent tag backgrounds were visually reviewed. This is not a claim of complete accessibility conformance.
- Desktop/mobile screenshots were inspected, including hero, projects, open case studies, experience, education, and contact. Local loading instrumentation observed cumulative layout shift of 0; this is a local diagnostic, not a field performance score.
- The PDF was text-extracted and visually rendered for review. Its content matches the current profile. The file is copied unchanged, rather than generated or rewritten.

No ESLint or TypeScript configuration exists in this static JavaScript repository. The existing syntax, regression, browser, and build commands were used; no framework or runtime dependency was introduced.

## Asset and link evidence

The LeafGuard and SentixAI public repository file lists contain no standalone screenshot assets. Their technical illustrations are retained. The existing FYP teacher screenshot is used specifically as a document library/upload interface; no unrelated application capabilities have been added to the case study. The FYP GitHub repository is empty and remains unlinked.

The verified GitHub profile and two project repository links are unchanged. LinkedIn previously returned its automated-access block (HTTP 999); the user-supplied URL is retained. No email was sent and no live-demo URL was invented.

## Remaining limitations

Live demo URLs, a verified public medicine-project repository, and a production domain are still unavailable. Domain-specific canonical/social URLs and a sitemap should be added when hosting is selected. No commit, push, or deployment was performed; the pre-existing Git staging state and source assets were preserved.
