import { defineConfig } from "vite";

export default defineConfig({
  base: "/tabulator-manager/",
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
