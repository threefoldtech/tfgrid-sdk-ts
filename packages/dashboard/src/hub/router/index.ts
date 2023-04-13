import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Cosmos from "../views/CosmosView.vue";
import Eth from "../views/EthView.vue";
import ListEth from "../views/ListEth.vue";
import TextProposal from "../views/TextProposal.vue";
import ListGov from "../views/ListGov.vue";
import ListValidators from "../views/ListValidators.vue";
import GovDetails from "../views/GovDetails.vue";
import GovDeposit from "../views/GovDeposit.vue";
import Delegate from "../views/Delegate.vue";
import AddProposal from "../views/AddProposal.vue";
import SoftwareProposal from "../views/SoftwareProposal.vue";
import { checkKeplr } from "../utils/checkKeplr";

Vue.use(VueRouter);

function requireKeplr(_: unknown, __: unknown, next: any) {
  checkKeplr()
    .then(() => next())
    .catch(() => next("/hub/list-proposals"));
}

export const hubRoutes: Array<RouteConfig> = [
  {
    path: "/hub/threefold-hub",
    name: "Cosmos",
    component: Cosmos,
    beforeEnter: requireKeplr,
  },
  {
    path: "/hub/bsc",
    name: "BSC",
    component: Eth,
    beforeEnter: requireKeplr,
  },
  {
    path: "/hub/list-bsc",
    component: ListEth,
    beforeEnter: requireKeplr,
  },
  {
    path: "/hub/validators",
    component: ListValidators,
  },
  {
    path: "/hub/delegate/:address",
    component: Delegate,
  },
  {
    path: "/hub/add-proposal",
    component: AddProposal,
    children: [
      {
        path: "/hub/add-proposal/",
        component: TextProposal,
        beforeEnter: requireKeplr,
      },
      {
        path: "/hub/add-proposal/software",
        component: SoftwareProposal,
        beforeEnter: requireKeplr,
      },
    ],
    beforeEnter: requireKeplr,
  },
  {
    path: "/hub/list-proposals",
    component: ListGov,
  },
  {
    path: "/hub/proposal/:id",
    component: GovDetails,
  },
  {
    path: "/hub/proposal/deposit/:id",
    component: GovDeposit,
  },
];

// const router = new VueRouter({
//   mode: "history",
//   base: process.env.BASE_URL,
//   routes,
// });

// export default router;
