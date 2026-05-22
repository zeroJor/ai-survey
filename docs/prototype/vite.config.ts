import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 5180,
    strictPort: false,
    open: "/talk",
  },
  preview: {
    port: 4180,
    open: "/talk",
  },
});
