import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, resolve } from "node:path";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const allowed = new Set([
  "/index.html",
  "/style.css",
  "/script.js",
  "/IMG.jpg",
  "/assets/favicon.svg",
  "/assets/Iqra-Nawaz-CV.docx",
]);
const types = {
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};
const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const file = pathname === "/" ? "/index.html" : pathname;
    if (!allowed.has(file)) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found");
      return;
    }
    const data = await readFile(resolve(root, `.${file}`));
    response.writeHead(200, {
      "Content-Type": types[extname(file)],
      "X-Content-Type-Options": "nosniff",
    });
    response.end(data);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Unable to load resource. Run npm run build first.");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Portfolio preview: http://127.0.0.1:${port}`),
);
