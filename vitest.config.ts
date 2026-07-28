import { defineConfig } from "vitest/config";

// Test edilen kod (src/lib/*) tamamen sunucu tarafı, saf Node mantığı —
// tarayıcı DOM'una hiç ihtiyaç yok, bu yüzden "node" ortamı yeterli ve
// jsdom'dan çok daha hızlı.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
