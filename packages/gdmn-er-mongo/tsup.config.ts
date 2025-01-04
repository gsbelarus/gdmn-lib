import { defineConfig } from "tsup";
export default defineConfig({
  entry: {
    ".": "src/index.ts",
  },
  format: ["cjs", "esm"],
  external: ["mongoose", "mongodb"],
  dts: true,
});