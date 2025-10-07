import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
  },
  base: "/",
  plugins: [vue(), nodePolyfills(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    "process.env": {
      NETWORK: process.env.NETWORK,
      TIMEOUT: 10000,
      VERSION: process.env.VERSION || "No version to show",
      INTERNAL_SOLUTION_PROVIDER_ID: process.env.INTERNAL_SOLUTION_PROVIDER_ID || 1,
    },
  },
});
