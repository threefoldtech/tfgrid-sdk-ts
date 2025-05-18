import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

import LoggedInLanding from "@/components/logged_in_landing.vue";
import { DashboardRoutes } from "@/router/routes";

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
  sidebarBreakpoint?: number;
  filtersCollapsibleBreakpoint?: number;
}

/**
 * Creates the routes for Applications section.
 *
 * @returns An array of route records for Applications.
 */
function createApplicationsRoutes(): RouteRecordRaw[] {
  return [
    {
      path: DashboardRoutes.Applications.BaseRoute,
      component: () => import("../views/solutions_view.vue"),
    },
    {
      path: DashboardRoutes.Applications.Kubernetes,
      component: () => import("../views/kubernetes_view.vue"),
      meta: {
        title: "Kubernetes",
        info: { page: "info/kubernetes.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Kubernetes",
            },
          ],
        },
        requireSSH: true,
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.CapRover,
      component: () => import("../views/caprover_view.vue"),
      meta: {
        title: "Caprover",
        info: { page: "info/caprover.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Caprover",
            },
          ],
        },
        requireSSH: true,
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Peertube,
      component: () => import("../views/peertube_view.vue"),
      meta: {
        title: "Peertube",
        info: { page: "info/peertube.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Peertube",
            },
          ],
        },
        publicPath: false,
      },
    },
    // {
    //   path: DashboardRoutes.Applications.Funkwhale,
    //   component: () => import("../views/funkwhale_view.vue"),
    //   meta: {
    //     title: "Funkwhale",
    //     info: { page: "info/funkwhale.md" },
    //     navbarConfig: {
    //       back: true,
    //       path: [
    //         { title: "Deploy" },
    //         {
    //           title: "Labs",
    //           disabled: false,
    //           to: DashboardRoutes.Deploy.Applications,
    //         },
    //         {
    //           title: "Funkwhale",
    //         },
    //       ],
    //     },
    //     publicPath: false,
    //   },
    // },
    {
      path: DashboardRoutes.Applications.Mattermost,
      component: () => import("../views/mattermost_view.vue"),
      meta: {
        title: "Mattermost",
        info: { page: "info/mattermost.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Mattermost",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Discourse,
      component: () => import("../views/discourse_view.vue"),
      meta: {
        title: "Discourse",
        info: { page: "info/discourse.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Discourse",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Taiga,
      component: () => import("../views/taiga_view.vue"),
      meta: {
        title: "Taiga",
        info: { page: "info/taiga.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Taiga",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Openwebui,
      component: () => import("../views/openwebui_view.vue"),
      meta: {
        title: "Open WebUI",
        info: { page: "info/openwebui.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Open WebUI",
            },
          ],
        },
      },
    },
    // {
    //   path: DashboardRoutes.Applications.Owncloud,
    //   component: () => import("../views/owncloud_view.vue"),
    //   meta: {
    //     title: "Owncloud",
    //     info: { page: "info/owncloud.md" },
    //     navbarConfig: {
    //       back: true,
    //       path: [
    //         { title: "Deploy" },
    //         {
    //           title: "Labs",
    //           disabled: false,
    //           to: DashboardRoutes.Deploy.Applications,
    //         },
    //         {
    //           title: "Owncloud",
    //         },
    //       ],
    //     },
    //     publicPath: false,
    //   },
    // },
    {
      path: DashboardRoutes.Applications.Nextcloud,
      component: () => import("../views/nextcloud_view.vue"),
      meta: {
        title: "Nextcloud",
        info: { page: "info/nextcloud.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Nextcloud",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Presearch,
      component: () => import("../views/presearch_view.vue"),
      meta: {
        title: "Presearch",
        info: { page: "info/presearch.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Presearch",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Subsquid,
      component: () => import("../views/subsquid_view.vue"),
      meta: {
        title: "Subsquid",
        info: { page: "info/subsquid.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Subsquid",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Casperlabs,
      component: () => import("../views/casperlabs_view.vue"),
      meta: {
        title: "Casperlabs",
        info: { page: "info/casperlabs.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Casperlabs",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Jitsi,
      component: () => import("../views/jitsi_view.vue"),
      meta: {
        title: "Jitsi",
        info: { page: "info/jitsi.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Jitsi",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Algorand,
      component: () => import("../views/algorand_view.vue"),
      meta: {
        title: "Algorand",
        info: { page: "info/algorand.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Algorand",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Nodepilot,
      component: () => import("../views/node_pilot.vue"),
      meta: {
        title: "Node Pilot",
        info: { page: "info/nodepilot.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Node Pilot",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Wordpress,
      component: () => import("../views/wordpress_view.vue"),
      meta: {
        title: "Wordpress",
        info: { page: "info/wordpress.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Wordpress",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Umbrel,
      component: () => import("../views/umbrel_view.vue"),
      meta: {
        title: "Umbrel",
        info: { page: "info/umbrel.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Umbrel",
            },
          ],
        },
        publicPath: false,
      },
    },

    {
      path: DashboardRoutes.Applications.StaticWebsite,
      component: () => import("../views/staticwebsite_view.vue"),
      meta: {
        title: "Static Website",
        info: { page: "info/static_website.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Static Website",
            },
          ],
        },
        publicPath: false,
      },
    },
    // Commented for now and will be user later.
    // {
    //   path: DashboardRoutes.Applications.Freeflow,
    //   component: () => import("../views/freeflow_view.vue"),
    //   meta: {
    //     title: "Freeflow",
    //     info: { page: "info/freeflow.md" },
    //     navbarConfig: {
    //       back: true,
    //       path: [
    //         { title: "Deploy" },
    //         {
    //           title: "Labs",
    //           disabled: false,
    //           to: DashboardRoutes.Deploy.Applications,
    //         },
    //         {
    //           title: "Freeflow",
    //         },
    //       ],
    //     },
    //     publicPath: false,
    //   },
    // },
    {
      path: DashboardRoutes.Applications.TFRobot,
      component: () => import("../views/tfrobot_view.vue"),
      meta: {
        title: "TFRobot",
        info: { page: "info/tfrobot.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "TFRobot",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Jenkins,
      component: () => import("../views/jenkins_view.vue"),
      meta: {
        title: "Jenkins",
        info: { page: "info/jenkins.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Jenkins",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Gitea,
      component: () => import("../views/gitea_view.vue"),
      meta: {
        title: "Gitea",
        info: { page: "info/gitea.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Gitea",
            },
          ],
        },
        publicPath: false,
      },
    },
    {
      path: DashboardRoutes.Applications.Nostr,
      component: () => import("../views/nostr_view.vue"),
      meta: {
        title: "Nostr",
        info: { page: "info/nostr.md" },
        navbarConfig: {
          back: true,
          path: [
            { title: "Deploy" },
            {
              title: "Labs",
              disabled: false,
              to: DashboardRoutes.Deploy.Applications,
            },
            {
              title: "Nostr",
            },
          ],
        },
        publicPath: false,
      },
    },
  ];
}

/**
 * Creates the routes for TFGrid section.
 *
 * @returns An array of route records for TFGrid.
 */
function createTFGridRoutes(): RouteRecordRaw[] {
  return [
    {
      path: DashboardRoutes.TFGrid.BaseRoute,
      children: [
        {
          path: DashboardRoutes.TFGrid.NodeStatistics,
          component: () => import("@/views/stats.vue"),
          meta: { title: "Statistics", publicPath: true },
        },
      ],
    },
  ];
}

/**
 * Creates the routes for TFFarms section.
 *
 * @returns An array of route records for TFFarms.
 */
function createTFFarmsRoutes(): RouteRecordRaw[] {
  return [
    {
      path: DashboardRoutes.Farms.BaseRoute,
      children: [
        {
          path: DashboardRoutes.Farms.YourFarms,
          component: () => import("../dashboard/farms_view.vue"),
          meta: { title: "Farms" },
        },
        {
          path: DashboardRoutes.Farms.FarmFinder,
          component: () => import("@/views/farms.vue"),
          meta: { title: "Farm Finder", publicPath: true, sidebarBreakpoint: 1000, filtersCollapsibleBreakpoint: 1350 },
        },
        {
          path: DashboardRoutes.Farms.Simulator,
          component: () => import("../dashboard/simulator_view.vue"),
          meta: { title: "Twin", publicPath: true },
        },
      ],
    },
  ];
}

/**
 * Creates the routes for TFChain section.
 *
 * @returns An array of route records for TFChain.
 */
function createTFChainRoutes(): RouteRecordRaw[] {
  return [
    {
      path: DashboardRoutes.TFChain.BaseRoute,
      children: [
        {
          name: "Profile",
          path: DashboardRoutes.TFChain.YourProfile,
          component: () => import("../dashboard/twin_view.vue"),
          meta: { title: "Your Profile" },
        },

        {
          path: DashboardRoutes.TFChain.TFDAO,
          name: "Dao",
          component: () => import("../dashboard/dao_view.vue"),
          meta: { title: "Dao" },
        },
        {
          path: DashboardRoutes.TFChain.TFTokenBridge,
          component: () => import("../dashboard/bridge_view.vue"),
          meta: { title: "Bridge" },
        },
        {
          path: DashboardRoutes.TFChain.TFTokenTransfer,
          component: () => import("../dashboard/transfer_view.vue"),
          meta: { title: "Transfer" },
        },
        {
          path: DashboardRoutes.TFChain.TFMintingReports,
          component: () => import("../views/minting_view.vue"),
        },
      ],
    },
  ];
}

/**
 * Creates the routes for Deploy section.
 *
 * @returns An array of route records for Deploy.
 */
function createDeployRoutes(): RouteRecordRaw[] {
  return [
    {
      path: DashboardRoutes.Deploy.BaseRoute,
      children: [
        {
          path: DashboardRoutes.Deploy.PricingCalculator,
          component: () => import("../calculator/pricing_calculator.vue"),
          meta: { title: "Resource Pricing", publicPath: true },
        },
        {
          path: DashboardRoutes.Deploy.Domains,
          component: () => import("@/views/domains_view.vue"),
          meta: { title: "Domains", info: { page: "info/domains.md" }, requireKYC: true },
        },
        {
          path: DashboardRoutes.Deploy.NodeFinder,
          component: () => import("@/views/nodes.vue"),
          meta: { title: "Nodes", publicPath: true, sidebarBreakpoint: 1150, filtersCollapsibleBreakpoint: 850 },
        },
        {
          path: DashboardRoutes.Deploy.VirtualMachines,
          children: [
            {
              path: "",
              component: () => import("../views/vms_view.vue"),
              meta: { title: "Virtual Machines", publicPath: true },
            },
            {
              path: DashboardRoutes.VirtualMachines.FullVirtualMachine,
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
                      to: DashboardRoutes.Deploy.VirtualMachines,
                    },
                    {
                      title: "Full Virtual Machine",
                    },
                  ],
                },
                requireSSH: true,
                requireKYC: true,
              },
            },
            {
              path: DashboardRoutes.VirtualMachines.MicroVirtualMachine,
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
                      to: DashboardRoutes.Deploy.VirtualMachines,
                    },
                    {
                      title: "Micro Virtual Machine",
                    },
                  ],
                },
                requireSSH: true,
                requireKYC: true,
              },
            },
          ],
        },

        {
          path: DashboardRoutes.Deploy.Orchestrators,
          children: [
            {
              path: "",
              redirect: DashboardRoutes.Deploy.Applications,
            },

            {
              path: "/deploy/orchestrators/kubernetes",
              redirect: DashboardRoutes.Applications.Kubernetes,
            },
            {
              path: "/deploy/orchestrators/caprover/",
              redirect: DashboardRoutes.Applications.CapRover,
            },
          ],
        },

        {
          path: DashboardRoutes.Deploy.Applications,
          meta: { title: "Labs", publicPath: true },
          children: createApplicationsRoutes(),
        },
        {
          path: "/deploy/applications/:catchAll(.*)",
          redirect: to => {
            return {
              path: `${DashboardRoutes.Deploy.Applications}${to.fullPath.split("/deploy/applications/")[1]}`,
            };
          },
        },

        {
          path: DashboardRoutes.Deploy.YourContracts,
          component: () => import("../dashboard/contracts_list.vue"),
          meta: {
            title: "Your Contracts List",
          },
        },

        {
          path: DashboardRoutes.Deploy.SSHKey,
          component: () => import("../views/sshkey_view.vue"),
          meta: { title: "SSHKey" },
          children: [],
        },
      ],
    },
  ];
}

/**
 * Main array of route records for the application, including Home, TFGrid, Deploy, TFChain, Applications, TFFarms, and NotFound routes.
 */
const mainRoutes: RouteRecordRaw[] = [
  // Home Routes
  {
    name: "landing",
    path: DashboardRoutes.Other.HomePage,
    component: LoggedInLanding,
    meta: { title: "Landing Page" },
  },
  // TFGrid Routes
  {
    path: DashboardRoutes.TFGrid.BaseRoute,
    children: createTFGridRoutes(),
  },
  // Deploy Routes
  {
    path: DashboardRoutes.Deploy.BaseRoute,
    children: createDeployRoutes(),
  },
  // TFFarms Routes
  {
    path: DashboardRoutes.Farms.BaseRoute,
    children: createTFFarmsRoutes(),
  },
  // TFChain Routes
  {
    path: DashboardRoutes.TFChain.BaseRoute,
    children: createTFChainRoutes(),
  },
  // Settings Route
  {
    path: DashboardRoutes.Other.Settings,
    component: () => import("../views/settings.vue"),
    meta: { title: "Settings" },
  },
  // NotFound
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../views/page_not_found.vue"),
    meta: { title: "Page Not Found", publicPath: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: mainRoutes,
  scrollBehavior(to, from, savedPosition) {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  },
});

/* Guard to verify monitor is completed */
const removeMonitorGuard = router.beforeEach(async (_, __, next) => {
  await window.$$monitorLock;
  removeMonitorGuard();
  return next();
});

export default router;
