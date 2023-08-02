import { createRouter, createWebHashHistory } from "vue-router";

export interface InfoMeta {
  /* Accepting md and html */
  // Example "info/full-vm-md"
  // Note: add page path as absolute one
  // so it get prefixed with current baseUrl
  page: string;
  tooltip?: string;
}

export interface RouteMeta {
  title: string;
  info?: InfoMeta;
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: () => import("../views/full_virtual_machine.vue"),
      meta: { title: "Full Virtual Machine", info: { page: "info/full_vm.md" } },
    },
    {
      path: "/vm",
      component: () => import("../views/micro_virtual_machine.vue"),
      meta: { title: "Micro Virtual Machine", info: { page: "info/vm.md" } },
    },
    {
      path: "/kubernetes",
      component: () => import("../views/kubernetes_view.vue"),
      meta: { title: "Kubernetes", info: { page: "info/kubernetes.md" } },
    },
    {
      path: "/caprover",
      component: () => import("../views/caprover_view.vue"),
      meta: { title: "Caprover", info: { page: "info/caprover.md" } },
    },
    {
      path: "/peertube",
      component: () => import("../views/peertube_view.vue"),
      meta: { title: "Peertube", info: { page: "info/peertube.md" } },
    },
    {
      path: "/funkwhale",
      component: () => import("../views/funkwhale_view.vue"),
      meta: { title: "Funkwhale", info: { page: "info/funkwhale.md" } },
    },
    {
      path: "/mattermost",
      component: () => import("../views/mattermost_view.vue"),
      meta: { title: "Mattermost", info: { page: "info/mattermost.md" } },
    },
    {
      path: "/discourse",
      component: () => import("../views/discourse_view.vue"),
      meta: { title: "Discourse", info: { page: "info/discourse.md" } },
    },
    {
      path: "/taiga",
      component: () => import("../views/taiga_view.vue"),
      meta: { title: "Taiga", info: { page: "info/taiga.md" } },
    },
    {
      path: "/owncloud",
      component: () => import("../views/owncloud_view.vue"),
      meta: { title: "Owncloud", info: { page: "info/owncloud.md" } },
    },
    {
      path: "/nextcloud",
      component: () => import("../views/nextcloud_view.vue"),
      meta: { title: "Nextcloud", info: { page: "info/nextcloud.md" } },
    },
    {
      path: "/presearch",
      component: () => import("../views/presearch_view.vue"),
      meta: { title: "Presearch", info: { page: "info/presearch.md" } },
    },
    {
      path: "/subsquid",
      component: () => import("../views/subsquid_view.vue"),
      meta: { title: "Subsquid", info: { page: "info/subsquid.md" } },
    },
    {
      path: "/casperlabs",
      component: () => import("../views/casperlabs_view.vue"),
      meta: { title: "Casperlabs", info: { page: "info/casperlabs.md" } },
    },
    {
      path: "/algorand",
      component: () => import("../views/algorand_view.vue"),
      meta: { title: "Algorand", info: { page: "info/algorand.md" } },
    },
    {
      path: "/nodepilot",
      component: () => import("../views/node_pilot.vue"),
      meta: { title: "Node Pilot", info: { page: "info/nodepilot.md" } },
    },
    {
      path: "/wordpress",
      component: () => import("../views/wordpress_view.vue"),
      meta: { title: "Wordpress", info: { page: "info/wordpress.md" } },
    },
    {
      path: "/umbrel",
      component: () => import("../views/umbrel_view.vue"),
      meta: { title: "Umbrel", info: { page: "info/umbrel.md" } },
    },
    {
      path: "/freeflow",
      component: () => import("../views/freeflow_view.vue"),
      meta: { title: "Freeflow", info: { page: "info/freeflow.md" } },
    },
    {
      path: "/contractslist",
      component: () => import("../views/contracts_list.vue"),
      meta: { title: "Contracts List", info: { page: "info/contracts_list.md" } },
    },
    {
      path: "/:pathMatch(.*)*",
      component: () => import("../views/page_not_found.vue"),
      meta: { title: "Page Not Found" },
    },
  ],
});

export default router;
