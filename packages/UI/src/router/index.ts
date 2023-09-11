import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "pdf",
      component: () => import("../views/PDFSignerView.ce.vue"),
      // props: {
      //   pdfurl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
      //   dest: "http://127.0.0.1:3000/api/verify",
      //   network: "dev",
      // }, // Uncomment this line for testing
    },
    {
      path: "/editor",
      name: "editor",
      component: () => import("../views/ScriptEditorView.ce.vue"),
    },
  ],
});

export default router;
