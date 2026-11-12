# Content TODOs

Placeholders are hidden from visitors. Open the site with `?draft` at the end of the URL
(e.g. `https://iqranawaz-debug.github.io/portfolio/?draft`) to see every slot outlined in red.
Search the code for `TODO(iqra)` to find each one. When you fill a slot, remove its `hidden`
attribute and its `data-todo` attribute.

## Homepage

- [ ] **Automated Data Pipeline — one-line result** (`index.html`, `#pipeline-project`, `.mini-result`).
      What did the FYP process, how much, and how was it evaluated?
- [ ] **Medicine Recommendation — repository link** (`#medicine-project`) once the repo is public.
- [ ] **Looping demo clips** for DeepTrace AI, ResumeIQ, Bank Marketing and Screenshot Organizer
      (homepage `.media-slot` in each project, plus one on each case-study page).
      Record ~10–20 s, export WebM under ~2 MB plus a WebP poster frame into `assets/work/`,
      then swap the slot for the `<video class="loop">` template in the comment above it and add
      both files to `tools/site-files.mjs`. The script plays clips only while visible and shows
      controls instead of autoplaying for reduced-motion visitors.
- [ ] **"What I'd do differently" notes** (homepage and case-study chapter 08). Drafted from each
      repo's documented limitations and next steps; confirm or rewrite them in your own words.

## Please confirm

- [ ] **SentixAI accuracy.** The old site said "~92% accuracy on 1,000+ reviews". The repository's
      current README reports 86.36% accuracy and 0.614 macro-F1 on 4,500 held-out reviews
      (majority baseline 78.4%). The site now uses the repository numbers.

## Toolkit and experience

- [ ] **"Used in production" tags.** No skill is tagged production yet, because nothing on the site
      documents a production deployment. If the Logiciel Services automation went live, switch its
      skills to `tag--prod` (see the TODO comment above the toolkit) and add the legend entry.
- [ ] **Power BI** is tagged "learning". It was listed because the SQL warehouse repo description
      mentions it; change the tag if you used it in that project.
- [ ] **Testimonial** (`.testimonial` after the experience timeline): a short quote from your
      Logiciel Services supervisor or a NED colleague, with their permission.
