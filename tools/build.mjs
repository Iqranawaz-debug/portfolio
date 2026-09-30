import { mkdir, copyFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
// Explicit allowlist keeps unreferenced certificates, source, and secrets out of deployment.
const files = [
  "index.html",
  "style.css",
  "script.js",
  "IMG.jpg",
  "assets/favicon.svg",
  "assets/images/fyp-teacher.png",
  "assets/images/fyp-teacher.webp",
  "assets/Iqra-Nawaz-Resume.pdf",
];
for (const file of files) {
  const target = resolve(root, "dist", file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(root, file), target);
}
// Remove only the obsolete generated download; preserve the original in assets/.
await rm(resolve(root, "dist/assets/Iqra-Nawaz-CV.docx"), { force: true });
console.log(`Production build complete: ${files.length} files in dist/.`);
