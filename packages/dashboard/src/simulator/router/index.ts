import { RouteConfig } from "vue-router";

export const calculatorRouter: RouteConfig[] = [
  {
    path: "/simulatot/farming",
    name: "Simulator",
    component: () => import("../views/Simulator.vue"),
  },
];
