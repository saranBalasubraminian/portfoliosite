import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // For local dev: add 127.0.0.1 rahul.localhost to /etc/hosts
    // Then access http://rahul.localhost:3000 to test subdomain routing
  },
});
