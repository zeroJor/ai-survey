import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_DEPLOY_BASE ?? "/",
  server: {
    port: 5180,
    strictPort: false,
    open: true,
  },
  preview: {
    port: 4180,
    open: true,
  },
});
