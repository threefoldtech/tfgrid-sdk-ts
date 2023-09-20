import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// List of custom element tags
const customElements = ["pdf-signer", "script-editor"];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => customElements.some(el => tag.includes(el)),
        },
      },
    }),
  ],
  build: {
    lib: {
      entry: "./src/main.ce.ts",
      name: "threefold-ui",
      // the proper extensions will be added
      fileName: "threefold-ui",
    },
    rollupOptions: {
      external: [
        "pdfjs-dist/types/src/display/api",
        "vue3-pdfjs/components/vue-pdf/vue-pdf-props",
        "./src/apiCustomElement.ts",
      ], // Add the module you want to ignore here
    },
  },
  define: {
    "process.env": process.env,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
