import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  dts: true,
  outDir: "dist",
  sourcemap: true,
  clean: true,
  splitting: false,
  shims: false,
  external: ["bcrypt"],
});
