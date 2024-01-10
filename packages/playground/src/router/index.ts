import { NetworkEnv } from "@threefold/grid_client";
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
      path: "/dashboard",
      children: [
        {
          name: "Twin",
          path: "twin",
          component: () => import("../dashboard/twin_view.vue"),
          meta: { title: "Your Twin" },
        },
        {
          path: "farms",
          component: () => import("../dashboard/farms_view.vue"),
          meta: { title: "Your Farms" },
        },
        {
          path: "contracts-list",
          component: () => import("../dashboard/contracts_list.vue"),
          meta: {
            title: "Your Contracts List",
            info: { page: "info/contracts_list.md" },
          },
        },
        {
          path: "dao",
          component: () => import("../dashboard/dao_view.vue"),
          meta: { title: "Dao" },
        },
        {
          path: "bridge",
          component: () => import("../dashboard/bridge_view.vue"),
          meta: { title: "Bridge" },
        },
        {
          path: "transfer",
          component: () => import("../dashboard/transfer_view.vue"),
          meta: { title: "Transfer" },
        },
        {
          path: "dedicated-nodes",
          component: () => import("../dashboard/dedicated_nodes_view.vue"),
          meta: { title: "Dedicated Nodes" },
        },
      ],
    },

    {
      path: "/calculator",
      children: [
        {
          path: "pricing",
          component: () => import("../calculator/resource_pricing.vue"),
          meta: { title: "Resource Pricing" },
        },

        {
          path: "simulator",
          component: () => import("../dashboard/simulator_view.vue"),
          meta: { title: "Twin" },
        },
      ],
    },
    {
      path: "/vms",
      component: () => import("../views/vms_view.vue"),
      meta: { title: "Virtual Machines" },
      children: [],
    },
    {
      path: "/sshkey",
      component: () => import("../views/sshkey_view.vue"),
      meta: { title: "SSHKey" },
      children: [],
    },
    {
      path: "/orchestrators",
      component: () => import("../views/orchestrators_view.vue"),
      meta: { title: "Orchestrators" },
      children: [],
    },

    {
      path: "/solutions",
      meta: { title: "Solutions" },
      children: [
        {
          path: "",
          component: () => import("../views/solutions_view.vue"),
        },
        {
          path: "fullvm",
          component: () => import("../views/full_virtual_machine.vue"),
          meta: {
            title: "Full Virtual Machine",
            info: { page: "info/full_vm.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Full Virtual Machine",
                },
              ],
            },
          },
        },
        {
          path: "vm",
          component: () => import("../views/micro_virtual_machine.vue"),
          meta: {
            title: "Micro Virtual Machine",
            info: { page: "info/vm.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Micro Virtual Machine",
                },
              ],
            },
          },
        },
        {
          path: "kubernetes",
          component: () => import("../views/kubernetes_view.vue"),
          meta: {
            title: "Kubernetes",
            info: { page: "info/kubernetes.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Kubernetes",
                },
              ],
            },
          },
        },
        {
          path: "caprover",
          component: () => import("../views/caprover_view.vue"),
          meta: {
            title: "Caprover",
            info: { page: "info/caprover.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Caprover",
                },
              ],
            },
          },
        },
        {
          path: "funkwhale",
          component: () => import("../views/funkwhale_view.vue"),
          meta: {
            title: "funkwhale",
            info: { page: "info/funkwhale.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "funkwhale",
                },
              ],
            },
          },
        },
        {
          path: "funkwhale",
          component: () => import("../views/funkwhale_view.vue"),
          meta: {
            title: "Funkwhale",
            info: { page: "info/funkwhale.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Funkwhale",
                },
              ],
            },
          },
        },
        {
          path: "mattermost",
          component: () => import("../views/mattermost_view.vue"),
          meta: {
            title: "Mattermost",
            info: { page: "info/mattermost.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Mattermost",
                },
              ],
            },
          },
        },
        {
          path: "discourse",
          component: () => import("../views/discourse_view.vue"),
          meta: {
            title: "Discourse",
            info: { page: "info/discourse.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Discourse",
                },
              ],
            },
          },
        },
        {
          path: "taiga",
          component: () => import("../views/taiga_view.vue"),
          meta: {
            title: "Taiga",
            info: { page: "info/taiga.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Taiga",
                },
              ],
            },
          },
        },
        {
          path: "owncloud",
          component: () => import("../views/owncloud_view.vue"),
          meta: {
            title: "Owncloud",
            info: { page: "info/owncloud.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Owncloud",
                },
              ],
            },
          },
        },
        {
          path: "nextcloud",
          component: () => import("../views/nextcloud_view.vue"),
          meta: {
            title: "Nextcloud",
            info: { page: "info/nextcloud.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Nextcloud",
                },
              ],
            },
          },
        },
        {
          path: "presearch",
          component: () => import("../views/presearch_view.vue"),
          meta: {
            title: "Presearch",
            info: { page: "info/presearch.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Presearch",
                },
              ],
            },
          },
        },
        {
          path: "subsquid",
          component: () => import("../views/subsquid_view.vue"),
          meta: {
            title: "Subsquid",
            info: { page: "info/subsquid.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Subsquid",
                },
              ],
            },
          },
        },
        {
          path: "casperlabs",
          component: () => import("../views/casperlabs_view.vue"),
          meta: {
            title: "Casperlabs",
            info: { page: "info/casperlabs.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Casperlabs",
                },
              ],
            },
          },
        },
        {
          path: "algorand",
          component: () => import("../views/algorand_view.vue"),
          meta: {
            title: "Algorand",
            info: { page: "info/algorand.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Algorand",
                },
              ],
            },
          },
        },
        {
          path: "nodepilot",
          component: () => import("../views/node_pilot.vue"),
          meta: {
            title: "Node Pilot",
            info: { page: "info/nodepilot.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Node Pilot",
                },
              ],
            },
          },
        },
        {
          path: "wordpress",
          component: () => import("../views/wordpress_view.vue"),
          meta: {
            title: "Wordpress",
            info: { page: "info/wordpress.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Wordpress",
                },
              ],
            },
          },
        },
        {
          path: "umbrel",
          component: () => import("../views/umbrel_view.vue"),
          meta: {
            title: "Umbrel",
            info: { page: "info/umbrel.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Umbrel",
                },
              ],
            },
          },
        },
        {
          path: "freeflow",
          component: () => import("../views/freeflow_view.vue"),
          meta: {
            title: "Freeflow",
            info: { page: "info/freeflow.md" },
            navbarConfig: {
              back: true,
              path: [
                {
                  title: "Solutions",
                  disabled: false,
                  to: "/solutions",
                },
                {
                  title: "Freeflow",
                },
              ],
            },
          },
        },
      ],
    },

    {
      path: "/minting",
      component: () => import("../views/minting_view.vue"),
      meta: { title: "Minting", info: { page: "info/minting.md" } },
    },
    {
      path: "/nodes",
      component: () => import("@/views/nodes.vue"),
      meta: { title: "Nodes" },
    },
    {
      path: "/farms",
      component: () => import("@/views/farms.vue"),
      meta: { title: "Farms" },
    },
    {
      path: "/stats",
      component: () => import("@/views/stats.vue"),
      meta: { title: "Statistics" },
    },
    {
      path: "/:pathMatch(.*)*",
      component: () => import("../views/page_not_found.vue"),
      meta: { title: "Page Not Found" },
    },
  ],
});

export default router;
