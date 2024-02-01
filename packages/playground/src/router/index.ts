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
  publicPath?: boolean;
  requireSSH?: boolean;
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: "landing",
      path: "/",
      component: () => import("../components/logged_in_landing.vue"),
      meta: { title: "Landing Page" },
    },

    // TF Grid
    {
      path: "/tf-grid",
      children: [
        {
          path: "stats",
          component: () => import("@/views/stats.vue"),
          meta: { title: "Statistics", publicPath: true },
        },
      ],
    },

    // Deploy
    {
      path: "/deploy",
      children: [
        {
          path: "pricing-calculator",
          component: () => import("../calculator/resource_pricing.vue"),
          meta: { title: "Resource Pricing", publicPath: true },
        },
        {
          path: "nodes",
          component: () => import("@/views/nodes.vue"),
          meta: { title: "Nodes", publicPath: true },
        },
        {
          path: "vms",
          children: [
            {
              path: "",
              component: () => import("../views/vms_view.vue"),
              meta: { title: "Virtual Machines" },
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
                    { title: "Deploy" },
                    {
                      title: "Virtual Machines",
                      disabled: false,
                      to: "/deploy/vms",
                    },
                    {
                      title: "Full Virtual Machine",
                    },
                  ],
                },
                requireSSH: true,
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
                    { title: "Deploy" },
                    {
                      title: "Virtual Machines",
                      disabled: false,
                      to: "/deploy/vms",
                    },
                    {
                      title: "Micro Virtual Machine",
                    },
                  ],
                },
                requireSSH: true,
              },
            },
          ],
        },

        {
          path: "orchestrators",
          children: [
            {
              path: "",
              component: () => import("../views/orchestrators_view.vue"),
              meta: { title: "Orchestrators" },
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
                    { title: "Deploy" },
                    {
                      title: "Orchestrators",
                      disabled: false,
                      to: "/deploy/orchestrators",
                    },
                    {
                      title: "Kubernetes",
                    },
                  ],
                },
                requireSSH: true,
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
                    { title: "Deploy" },
                    {
                      title: "Orchestrators",
                      disabled: false,
                      to: "/deploy/orchestrators",
                    },
                    {
                      title: "Caprover",
                    },
                  ],
                },
                requireSSH: true,
              },
            },
          ],
        },

        {
          path: "dedicated-nodes",
          component: () => import("../dashboard/dedicated_nodes_view.vue"),
          meta: { title: "Dedicated Nodes" },
        },

        {
          path: "applications",
          meta: { title: "Applications" },
          children: [
            {
              path: "",
              component: () => import("../views/solutions_view.vue"),
            },

            {
              path: "/solutions/peertube",
              component: () => import("../views/peertube_view.vue"),
              meta: {
                title: "Peertube",
                info: { page: "info/peertube.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Peertube",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/funkwhale",
              component: () => import("../views/funkwhale_view.vue"),
              meta: {
                title: "Funkwhale",
                info: { page: "info/funkwhale.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Funkwhale",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/mattermost",
              component: () => import("../views/mattermost_view.vue"),
              meta: {
                title: "Mattermost",
                info: { page: "info/mattermost.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Mattermost",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/discourse",
              component: () => import("../views/discourse_view.vue"),
              meta: {
                title: "Discourse",
                info: { page: "info/discourse.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Discourse",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/taiga",
              component: () => import("../views/taiga_view.vue"),
              meta: {
                title: "Taiga",
                info: { page: "info/taiga.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Taiga",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/owncloud",
              component: () => import("../views/owncloud_view.vue"),
              meta: {
                title: "Owncloud",
                info: { page: "info/owncloud.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Owncloud",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/nextcloud",
              component: () => import("../views/nextcloud_view.vue"),
              meta: {
                title: "Nextcloud",
                info: { page: "info/nextcloud.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Nextcloud",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/presearch",
              component: () => import("../views/presearch_view.vue"),
              meta: {
                title: "Presearch",
                info: { page: "info/presearch.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Presearch",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/subsquid",
              component: () => import("../views/subsquid_view.vue"),
              meta: {
                title: "Subsquid",
                info: { page: "info/subsquid.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Subsquid",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/casperlabs",
              component: () => import("../views/casperlabs_view.vue"),
              meta: {
                title: "Casperlabs",
                info: { page: "info/casperlabs.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Casperlabs",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/algorand",
              component: () => import("../views/algorand_view.vue"),
              meta: {
                title: "Algorand",
                info: { page: "info/algorand.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Algorand",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/nodepilot",
              component: () => import("../views/node_pilot.vue"),
              meta: {
                title: "Node Pilot",
                info: { page: "info/nodepilot.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Node Pilot",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/wordpress",
              component: () => import("../views/wordpress_view.vue"),
              meta: {
                title: "Wordpress",
                info: { page: "info/wordpress.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Wordpress",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/umbrel",
              component: () => import("../views/umbrel_view.vue"),
              meta: {
                title: "Umbrel",
                info: { page: "info/umbrel.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
                    },
                    {
                      title: "Umbrel",
                    },
                  ],
                },
              },
            },
            {
              path: "/solutions/freeflow",
              component: () => import("../views/freeflow_view.vue"),
              meta: {
                title: "Freeflow",
                info: { page: "info/freeflow.md" },
                navbarConfig: {
                  back: true,
                  path: [
                    { title: "Deploy" },
                    {
                      title: "Applications",
                      disabled: false,
                      to: "/deploy/applications",
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
          path: "contracts-list",
          component: () => import("../dashboard/contracts_list.vue"),
          meta: {
            title: "Your Contracts List",
            info: { page: "info/contracts_list.md" },
          },
        },

        {
          path: "sshkey",
          component: () => import("../views/sshkey_view.vue"),
          meta: { title: "SSHKey" },
          children: [],
        },
      ],
    },

    {
      path: "/farms",
      children: [
        {
          path: "",
          component: () => import("../dashboard/farms_view.vue"),
          meta: { title: "Farms" },
        },
        {
          path: "farm-finder",
          component: () => import("@/views/farms.vue"),
          meta: { title: "Farm Finder", publicPath: true },
        },
        {
          path: "simulator-calculator",
          component: () => import("../dashboard/simulator_view.vue"),
          meta: { title: "Twin", publicPath: true },
        },
      ],
    },

    {
      path: "/tf-chain",
      children: [
        {
          name: "Twin",
          path: "twin",
          component: () => import("../dashboard/twin_view.vue"),
          meta: { title: "Your Twin" },
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
          path: "minting",
          component: () => import("../views/minting_view.vue"),
          meta: { title: "Minting", info: { page: "info/minting.md" }, publicPath: true },
        },
      ],
    },

    {
      path: "/:pathMatch(.*)*",
      component: () => import("../views/page_not_found.vue"),
      meta: { title: "Page Not Found", publicPath: true },
    },
  ],
});

export default router;
