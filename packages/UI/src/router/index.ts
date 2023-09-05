import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "pdf",
      component: () => import("../views/PDFSignerView.ce.vue"),
      props: {
        pdfUrl: import.meta.env.VITE_APP_PDF_URL as string,
      },
    },
    {
      path: "/editor",
      name: "editor",
      component: () => import("../views/ScriptEditorView.ce.vue"),
    },
  ],
});

export default router;
