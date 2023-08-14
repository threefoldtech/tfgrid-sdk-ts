import { RouteConfig } from "vue-router";

import WelcomeWindow from "@/other/views/WelcomeWindow.vue";
import AccountView from "@/portal/views/Account.vue";
import DaoView from "@/portal/views/Dao.vue";
import NodesView from "@/portal/views/Nodes.vue";
import SwapView from "@/portal/views/Swap.vue";
import TransferView from "@/portal/views/Transfer.vue";
import TwinView from "@/portal/views/Twin.vue";
export const portalRouter: RouteConfig[] = [
  {
    path: "/",
    name: "accounts",
    component: WelcomeWindow,
  },
  {
    path: "/portal/",
    name: "account",
    component: AccountView,
  },
  {
    path: "/portal/account-twin",
    name: "account-twin",
    component: TwinView,
  },
  {
    path: "/portal/account-swap",
    name: "account-swap",
    component: SwapView,
  },
  {
    path: "/portal/account-transfer",
    name: "account-transfer",
    component: TransferView,
  },
  {
    path: "/portal/account-farms",
    name: "account-farms",
    component: () => import("../views/Farms.vue"),
  },
  {
    path: "/portal/account-dao",
    name: "account-dao",
    component: DaoView,
  },
  {
    path: "/portal/account-nodes",
    name: "account-nodes",
    component: NodesView,
  },
];
