# Iqra Nawaz — Portfolio

A static HTML, CSS, and JavaScript portfolio. No framework, external font, CDN, runtime dependency, API key, or contact backend is required. Content is semantic HTML, so it remains available without JavaScript. Native details elements provide project case studies.

## Run and verify

Use Node.js 18 or newer. There are no packages to install.

```sh
npm run check
npm test
npm run build
npm start
```

The preview serves the production `dist` directory at http://127.0.0.1:4173. Publish the contents of `dist` to a static host. The build copies only public, referenced assets; existing unused images and certificates are preserved in the source repository.

Optional browser regression: with Playwright available and Microsoft Edge installed, keep `npm start` running and use `npm run test:browser`. Set `PLAYWRIGHT_MODULE` to an installed Playwright module path if it is outside this repository. The test uses headless Edge and writes ignored screenshots to `test-results/`. Playwright is a QA tool only, not a site dependency.

## Editing

- `index.html`: profile, projects, experience, education, certifications, contact, and metadata. Each content item has one canonical location.
- `style.css`: shared design tokens and responsive layouts (640, 900, 1100, and 1500px), reduced-motion and print styles.
- `script.js`: responsive navigation, active section, and current year.
- `assets/favicon.svg`: initials favicon.
- `tools/`: dependency-free build and local preview.
- `tests/`: navigation, asset, privacy/contact, and factual-content regression checks.

## Content and deployment notes

The supplied current profile is the content source of truth. The medicine project is in development. SentixAI's supplied result is approximately 92% on 1,000+ product reviews; no evaluation protocol or other project metrics have been invented.

The user-supplied CV is preserved unchanged at `assets/Iqra-Nawaz-CV.docx` and linked as a DOCX download. The supplied GitHub profile and matching public LeafGuard AI and sentiment-analysis repositories are linked. No medicine repository, verified live demos, or production domain was supplied. The FYP repository has no README, so it is not linked to the revised project description without a confirmed match. Existing certificate files have been preserved; their contents were not independently matched to the supplied current certification dates, so they are not linked as evidence.

After choosing a production domain, add its canonical URL, `og:url`, an absolute social preview image URL, and a sitemap. Relative asset paths already support deployment in a subdirectory. No environment variables are needed. The preview server is for local development only.

Email actions open the visitor's email application. They do not claim to submit a message. No analytics or user data collection is implemented.
