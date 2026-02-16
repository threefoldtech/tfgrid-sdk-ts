import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large vendor libraries into separate chunks
          vuetify: ["vuetify"],
          "threefold-sdk": [
            "@threefold/grid_client",
            "@threefold/gridproxy_client",
            "@threefold/graphql_client",
            "@threefold/types",
          ],
          chart: ["chart.js", "vue-chartjs"],
          // Note: lodash is NOT included here to allow Vite to handle tree-shaking automatically
          // This prevents chunk loading issues in development mode
          utils: ["moment", "marked"],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
  },
  optimizeDeps: {
    // Pre-bundle lodash sub-modules to prevent reload prompts in development
    include: [
      "lodash/isEqual.js",
      "lodash/cloneDeep.js",
      "lodash/isEmpty.js",
      "lodash/debounce.js",
      "lodash/sortBy.js",
      "lodash/fp/noop.js",
      "lodash/fp/shuffle.js",
      "lodash/fp/equals.js",
      "lodash/fp/uniq.js",
    ],
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
