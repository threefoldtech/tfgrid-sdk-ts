import { RouteConfig } from "vue-router";

export const explorerRouter: RouteConfig[] = [
  {
    path: "/explorer/statistics",
    name: "Statistics",
    component: () => import("../views/Statistics.vue"),
  },
  {
    path: "/explorer/nodes",
    name: "Nodes",
    component: () => import("../views/Nodes.vue"),
  },
  {
    path: "/explorer/farms",
    name: "Farms",
    component: () => import("../views/Farms.vue"),
  },
];
