import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      reporter: ["html", "text", "json"],
      reportsDirectory: "./coverage",
      provider: "v8",
      include: ["src/**/*.{js,ts,jsx,tsx}"],
    },

    globals: true,
    environment: 'jsdom',
  },
});
