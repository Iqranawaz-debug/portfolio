import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, resolve } from "node:path";
import { gzipSync } from "node:zlib";
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
// Text assets are gzipped, as GitHub Pages does, so local Lighthouse runs reflect production.
const compressible = new Set([".html", ".css", ".js", ".svg", ".txt", ".xml"]);
function send(request, response, status, ext, data) {
  const type = types[ext] || "application/octet-stream";
  const headers = { "Content-Type": type, "X-Content-Type-Options": "nosniff", Vary: "Accept-Encoding" };
  if (compressible.has(ext) && /\bgzip\b/.test(request.headers["accept-encoding"] || "")) {
    headers["Content-Encoding"] = "gzip";
    data = gzipSync(data);
  }
  response.writeHead(status, headers);
  response.end(data);
}
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
      send(request, response, 404, ".html", notFound);
      return;
    }
    const data = await readFile(resolve(root, `.${file}`));
    send(request, response, 200, extname(file), data);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.end("Unable to load resource. Run npm run build first.");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Portfolio preview: http://127.0.0.1:${port}`),
);
