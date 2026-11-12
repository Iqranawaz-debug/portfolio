// Single source of truth for every public file. GitHub Pages serves the repository root
// directly; `npm run build` copies only these files into dist/ for other static hosts,
// and the preview server refuses anything not listed here.
export const pages = [
  "index.html",
  "404.html",
  "work/deeptrace-ai.html",
  "work/resumeiq.html",
  "work/bank-marketing-intelligence.html",
];

export const siteFiles = [
  ...pages,
  "style.css",
  "script.js",
  "IMG.jpg",
  "sitemap.xml",
  "robots.txt",
  "assets/favicon.svg",
  "assets/og-card.png",
  "assets/Iqra-Nawaz-Resume.pdf",
  "assets/images/fyp-teacher.png",
  "assets/images/portrait.webp",
  "assets/fonts/fraunces-var.woff2",
  "assets/fonts/fraunces-var-italic.woff2",
  "assets/fonts/plex-mono-400.woff2",
  "assets/fonts/plex-mono-500.woff2",
  "assets/fonts/LICENSE-OFL.txt",
  "assets/work/resumeiq-requirements.webp",
  "assets/work/resumeiq-upload.webp",
  "assets/work/resumeiq-score.webp",
  "assets/work/bank-performance.webp",
  "assets/work/bank-explainability.webp",
  "assets/work/bank-dashboard.webp",
  "assets/work/bank-batch.webp",
  "assets/work/warehouse-architecture.webp",
  "assets/work/warehouse-model.webp",
];
