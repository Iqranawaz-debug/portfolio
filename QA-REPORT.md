# QA report — editorial redesign

Date: 12 November 2026

## Automated checks (all passing)

| Check | Result |
|---|---|
| `npm run check` | JavaScript and tool syntax OK |
| `npm test` | 10 tests: manifest files exist; every local link, anchor and asset resolves and ships in the build; safe external links; one h1, lang and alt text on every page; verified facts and stated limitations present; filter degrades without JS; 2 live demos; 21 legacy anchors from the previous site still resolve |
| `npm run build` | 29 public files copied to `dist/` |
| `npm run test:browser` (bundled Chromium) | 4 pages × 8 widths (320–1920px): no horizontal overflow, every image decodes, zero console errors or failed requests. Desktop nav and active section, archive filter, citation link resetting a filter, hover preview, annotation highlighting, theme toggle persisting across pages, case-study navigation, mobile menu with Escape and focus return, skip link, resume download, resize, reduced motion, no-JavaScript reading, styled 404 at a nested path |
| axe-core 4.10.3 (WCAG 2.1 A/AA + best practice) | 0 violations on all 5 pages, in light and dark themes, at 390px and 1440px |
| Local performance probe | Home page about 345 KB initial load, CLS 0.003 (a local diagnostic, not a field score) |

## Content sources

Every number on the site is taken from the project repositories: the DeepTrace AI closure report, ResumeIQ phase reports and README, the Bank Marketing app's Model Performance page and training code, and the Screenshot Organizer README and test folder. Collaboration on ResumeIQ was checked against its commit history.

## Not verified

- A manual screen-reader pass (VoiceOver/NVDA) has not been done.
- Real-device testing on iOS Safari and Android Chrome has not been done; layouts were checked in Chromium at phone, tablet and desktop widths.
- Live demo availability depends on Streamlit Community Cloud, which may sleep.
