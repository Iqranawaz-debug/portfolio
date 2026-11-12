import { mkdir, copyFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { siteFiles } from "./site-files.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
// Explicit allowlist keeps certificates, source, tooling and secrets out of deployment.
await rm(resolve(root, "dist"), { recursive: true, force: true });
for (const file of siteFiles) {
  const target = resolve(root, "dist", file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(root, file), target);
}
console.log(`Production build complete: ${siteFiles.length} files in dist/.`);
