import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs", "iife"],
  globalName: "TabulatorManager",
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : format === "cjs" ? ".cjs" : ".global.js",
    };
  },
});
