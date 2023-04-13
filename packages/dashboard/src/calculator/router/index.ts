import { RouteConfig } from "vue-router";
/* eslint-disable */
export const calculatorRouter: RouteConfig[] = [
  {
    path: "/calculator/calculator",
    name: "Calculator",
    component: () => import("../views/Calculator.vue"),
  },
  {
    path: "/calculator/simulator",
    name: "Simulator",
    component: () => import("../views/Simulator.vue"),
  },
];
