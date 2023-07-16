import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

import BootstrapView from "../views/BootstrapView.vue";
import MintingView from "../views/MintingView.vue";
Vue.use(VueRouter);

export const otherRoutes: Array<RouteConfig> = [
  {
    path: "/other/bootstrap",
    component: BootstrapView,
  },
  {
    path: "/other/minting",
    component: MintingView,
  },
];
