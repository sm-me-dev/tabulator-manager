import { defineConfig } from "vite";

// On GitHub Actions GITHUB_REPOSITORY is "<owner>/<repo>"; Project Pages are
// served from "/<repo>/". Locally (and for custom domains) we serve from "/".
const base = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
  : "/";

export default defineConfig({
  base,
  // `public/` (including mockServiceWorker.js) is copied verbatim to the
  // root of `dist/`, so the worker is served at `${base}mockServiceWorker.js`.
  publicDir: "public",
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
  },
});
