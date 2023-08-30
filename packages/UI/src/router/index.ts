import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/PDFSignerFormView.vue"),
    },
    {
      path: "/pdf",
      name: "pdf",
      component: () => import("../views/PDFSignerView.vue"),
    },
  ],
});

export default router;
