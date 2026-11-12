import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, resolve } from "node:path";
import { siteFiles } from "./site-files.mjs";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const allowed = new Set(siteFiles.map((file) => `/${file}`));
const types = {
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};
const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const file = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
    if (!allowed.has(file)) {
      // Mirror GitHub Pages: unknown routes get the custom 404 page with a 404 status.
      const notFound = await readFile(resolve(root, "404.html"));
      response.writeHead(404, { "Content-Type": types[".html"] });
      response.end(notFound);
      return;
    }
    const data = await readFile(resolve(root, `.${file}`));
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(data);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.end("Unable to load resource. Run npm run build first.");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Portfolio preview: http://127.0.0.1:${port}`),
);
