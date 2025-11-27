import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Use Vite defaults:
  // - Build output: /dist
  // - Copies everything from /public into /dist as static assets
});
