import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["esm", "cjs"],
  target: "node24",
  platform: "node",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  dts: false,
  shims: false,
  splitting: false,
  minify: false,
  banner: {
    js: "#!/usr/bin/env node\n",
  },
});
