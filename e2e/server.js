import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".cjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

export function createServer() {
  const requestCounts = {
    total: 0,
    byPath: {},
  };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost:3344"}`);
    requestCounts.total++;
    requestCounts.byPath[url.pathname] = (requestCounts.byPath[url.pathname] || 0) + 1;

    // API endpoint for server-side paginated data
    if (url.pathname.startsWith("/api/articles")) {
      const page = Number(url.searchParams.get("tm[articles][page]") || 1);
      const allArticles = [
        { id: 1, title: "First Article", status: "published" },
        { id: 2, title: "Second Article", status: "draft" },
        { id: 3, title: "Third Article", status: "published" },
        { id: 4, title: "Fourth Article", status: "archived" },
        { id: 5, title: "Fifth Article", status: "published" },
      ];
      const perPage = 2;
      const start = (page - 1) * perPage;
      const data = allArticles.slice(start, start + perPage);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          data,
          meta: {
            current_page: page,
            per_page: perPage,
            total: allArticles.length,
            last_page: Math.ceil(allArticles.length / perPage),
          },
        })
      );
      return;
    }

    // Health/Metrics endpoint
    if (url.pathname === "/__metrics") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(requestCounts));
      return;
    }

    // Map URL path to static files
    let filePath;
    if (url.pathname.startsWith("/fixtures/")) {
      filePath = path.join(__dirname, "fixtures", url.pathname.replace(/^\/fixtures\//, ""));
    } else if (url.pathname.startsWith("/packages/core/dist/")) {
      filePath = path.join(ROOT, "packages", "core", "dist", url.pathname.replace(/^\/packages\/core\/dist\//, ""));
    } else {
      filePath = path.join(__dirname, "fixtures", url.pathname);
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found: " + url.pathname);
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(data);
    });
  });

  return { server, requestCounts };
}

// Start standalone server when executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT || 3344;
  const { server } = createServer();
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`E2E Fixture Server running on http://127.0.0.1:${PORT}`);
  });
}
