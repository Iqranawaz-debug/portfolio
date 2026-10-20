<div align="center">

# ✨ Iqra Nawaz | Developer Portfolio

### A little about me, a lot about what I love to build.

**A fast, responsive, thoughtfully crafted portfolio — made with HTML, CSS & JavaScript.**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Responsive](https://img.shields.io/badge/Responsive-Design-7952B3?style=for-the-badge)
![Zero dependencies](https://img.shields.io/badge/Runtime_Dependencies-0-16A34A?style=for-the-badge)

**[Explore the projects](#-what-youll-find) · [Run locally](#-quick-start) · [How it works](#-project-structure)**

</div>

---

## 👋 Hello, world!

Welcome to my personal corner of the web! This portfolio brings together my projects, technical skills, experience, education, and learning journey in one place.

I wanted it to feel **clean, easy to explore, and personal** — without sacrificing accessibility or performance. So I built it with the web's fundamentals: **semantic HTML, modern CSS, and vanilla JavaScript**.

> **The idea:** Let the work tell the story — no unnecessary frameworks, heavy bundles, or complicated setup.

## 🌟 Highlights

| ✨ Feature | 💡 What it offers |
|---|---|
| **Responsive layout** | Designed for mobile, tablet, and desktop screens |
| **Project case studies** | Expandable project details with native HTML `<details>` |
| **Skills & experience** | A clear overview of tools, work, and learning |
| **Education & certifications** | Dedicated sections for academic and professional growth |
| **Resume access** | Downloadable PDF resume from the navbar and hero section |
| **Accessible by design** | Semantic content available even with JavaScript disabled |
| **Smooth navigation** | Responsive menu and active-section highlighting |
| **Lightweight build** | No framework, CDN, external fonts, or production dependencies |
| **Privacy-friendly** | No analytics, API keys, or backend data collection |
| **Reduced-motion support** | Respects visitors' motion preferences |

## 🖼️ Sneak peek

<!-- Add an actual screenshot of your portfolio at the indicated path. -->
<!-- Example: ![Portfolio home page](assets/portfolio-preview.png) -->

**Portfolio preview coming soon.** Add a real screenshot of the home page to showcase the finished design.

For the best GitHub preview, consider including a desktop screenshot and a mobile screenshot. Avoid using images that haven't been added to the repository.

## 🧭 What you'll find

- **About** — Who I am and what motivates me.
- **Projects** — Selected builds and expandable case studies, including work in AI and software development.
- **Experience** — Practical work and relevant responsibilities.
- **Education** — My academic background.
- **Certifications** — Courses and credentials I've completed.
- **Contact** — Ways to connect; email links open the visitor's own mail app.

The project's content reflects the profile and portfolio materials supplied during development. **Projects and demos aren't presented as deployed unless a verified link exists.**

## 🛠️ Built with

| Technology | Role |
|---|---|
| **HTML5** | Semantic structure and accessible content |
| **CSS3** | Styling, responsive layouts, transitions, and design tokens |
| **Vanilla JavaScript** | Mobile navigation, active-section behavior, and dynamic year |
| **Node.js 18+** | Local checks, build, and preview scripts — **not** a site runtime dependency |
| **Playwright + Edge (optional)** | Browser regression testing |

### 💡 Why no frontend framework?

This is a deliberately small static site. Vanilla web technologies keep it straightforward to host, inspect, and maintain. The important content remains readable without JavaScript.

## 🚀 Quick start

You'll need **Node.js 18 or newer** for the provided development scripts. No npm packages need to be installed.

```bash
# Verify project structure and assets
npm run check

# Run automated checks
npm test

# Build the static site
npm run build

# Preview the production output
npm start
```

Open **http://127.0.0.1:4173** to see the local production preview.

> The website itself is static. The Node scripts are development and build utilities, not a required backend server in production.

## 🗂️ Project structure

```text
portfolio/
├── index.html                    # Content, sections, case studies & metadata
├── style.css                     # Design tokens and responsive styling
├── script.js                     # Navigation and small UI enhancements
├── assets/
│   ├── favicon.svg               # Portfolio favicon
│   └── Iqra-Nawaz-Resume.pdf     # Downloadable resume
├── tools/                         # Dependency-free build and preview scripts
├── tests/                         # Automated project checks
├── package.json                   # Development commands
└── dist/                          # Generated static deployment output
```

`dist/` is generated by the build. It contains the public files needed for deployment; unrelated source images and certificates remain untouched in the source repository.

## 🧩 How it works

```mermaid
flowchart TD
    A[Semantic HTML content] --> D[Portfolio web pages]
    B[Responsive CSS styles] --> D
    C[Vanilla JavaScript enhancements] --> D
    D --> E[Local checks and build]
    E --> F[dist/ static site]
    F --> G[Static hosting provider]
```

- **HTML** holds the actual content, including the project case studies.
- **CSS** handles the visual design, breakpoints, reduced-motion styles, and printing.
- **JavaScript** enhances navigation without being required to read the core content.
- **Build scripts** prepare only referenced public assets for static hosting.

## 📱 Responsive and accessible

The layout includes breakpoints at **640px, 900px, 1100px, and 1500px**. Desktop navigation stays visible above 900px; smaller screens use a collapsible menu.

Project case studies use native `<details>` elements. Where supported, CSS adds progressive transitions, with an immediate alternative when a visitor prefers reduced motion. The site also includes print styling.

## 🧪 Testing and quality checks

```bash
npm run check
npm test
npm run build
```

The automated checks cover areas including **navigation, referenced assets, contact/privacy behavior, and factual content**.

For optional browser-level regression tests, install/configure Playwright and Microsoft Edge separately, start the preview with `npm start`, then run:

```bash
npm run test:browser
```

If Playwright is installed outside the project, `PLAYWRIGHT_MODULE` can point to its module path. Headless browser test screenshots are saved under ignored `test-results/`. **Playwright is only for testing, not a website dependency.**

## 🌍 Deployment

Run:

```bash
npm run build
```

Deploy the **contents of `dist/`** to your preferred static hosting service. Since the site uses relative asset paths, it can also work under a repository subdirectory.

Before publishing to a permanent domain, consider adding:

- A canonical production URL and matching Open Graph `og:url`.
- An absolute social-preview image URL.
- A sitemap for the chosen domain.

**Note:** The local preview server is intended for development, not as a public production server.

## ✏️ Customizing the portfolio

| File or folder | Update this when you want to… |
|---|---|
| `index.html` | Edit your introduction, projects, experience, education, certifications, or contact links |
| `style.css` | Change colors, spacing, responsive styles, and animations |
| `script.js` | Adjust navigation enhancements |
| `assets/` | Update your resume, favicon, or referenced images |
| `tests/` | Maintain regression checks after changing content or navigation |

Your resume download currently points to `assets/Iqra-Nawaz-Resume.pdf`. Contact links open an email application; **there is no contact-form backend**.

## 🔍 Content integrity and honest project showcases

A portfolio should be attractive **and** accurate. This site avoids invented metrics or unsupported deployment claims.

- The medicine-related project is described as **in development**.
- The supplied sentiment-analysis result is presented as approximately **92% on 1,000+ reviews**, without inventing an evaluation protocol.
- The FYP image caption identifies it as an interface preview, not as performance evidence.
- Missing or empty repositories are not presented as working public demos.
- Certificate files remain in source, but unverified certificates are not linked as evidence.
- No contact analytics or user-data collection is implemented.

## 🧭 What's next?

Ideas for future improvements:

- [ ] Add real desktop and mobile preview screenshots.
- [ ] Add verified live demo links when projects are deployed.
- [ ] Configure production SEO metadata and a sitemap.
- [ ] Continue expanding project case studies as projects evolve.
- [ ] Explore further accessibility and performance audits.

## 🤝 Let's connect

I'm always interested in learning new technologies, improving my work, and connecting with people who enjoy building things.

**Find my contact and profile links directly on the portfolio website.**

---

<div align="center">

### Built with ❤️ and dedication

**Made by Iqra Nawaz**

*Every project is another opportunity to learn something new.* ✨

</div>
