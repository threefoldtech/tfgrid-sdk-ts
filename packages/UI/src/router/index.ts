import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/pdf",
      name: "pdf",
      component: () => import("../views/PDFSignerView.vue"),
    },
  ],
});

export default router;
