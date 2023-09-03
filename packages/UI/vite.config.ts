import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.includes("pdf-signer"),
        },
      },
    }),
  ],
  build: {
    lib: {
      entry: "./src/main.ce.ts",
      name: "pdf-signer",
      // the proper extensions will be added
      fileName: "pdf-signer",
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
