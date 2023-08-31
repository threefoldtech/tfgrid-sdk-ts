import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "pdf",
      component: () => import("../views/PDFSignerView.vue"),
    },
    {
      path: "/editor",
      name: "editor",
      component: () => import("../views/ScriptEditorView.vue"),
    },
  ],
});

export default router;
