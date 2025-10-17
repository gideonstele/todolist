import { defineConfig } from "vite";

import * as os from "node:os";
import * as path from "node:path";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: "./",
  build: {
    outDir: path.join(os.homedir(), "fe-test"),
    emptyOutDir: true,
  },
});
