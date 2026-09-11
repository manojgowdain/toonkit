import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "toonkit": "/toonjs/src",
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
});