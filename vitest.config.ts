import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": srcPath
    }
  },
  test: {
    exclude: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/dev-dist/**",
      "**/.claude/**",
      "**/e2e/**",
      "**/playwright-report/**",
      "**/test-results/**"
    ]
  }
});
