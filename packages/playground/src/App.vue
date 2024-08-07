<template>
  <v-app>
    <TfNavigationLoader />
    <TfOfflineNotifier />
    <profile-manager-controller>
      <v-navigation-drawer
        width="280"
        :permanent="permanent"
        :model-value="openSidebar"
        @update:model-value="openSidebar = $event"
      >
        <div :style="{ paddingTop: '64px' }">
          <div
            :style="{
              maxHeight: 'calc(100vh - 64px)',
              overflowY: 'auto',
            }"
          >
            <v-list>
              <template v-for="route in routes" :key="route.title">
                <v-list-group v-if="route.items.length > 1" :value="route.title">
                  <template v-slot:activator="{ props }">
                    <v-list-item style="font-weight: 500" v-bind="props" :prepend-icon="route.icon">
                      <v-list-item-title class="font-weight-bold">
                        <v-tooltip :text="route.tooltip" :disabled="!route.tooltip">
                          <template #activator="{ props }">
                            <span v-bind="props">
                              {{ route.title }}
                            </span>
                          </template>
                        </v-tooltip>
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                  <v-list-item
                    v-for="item in route.items"
                    :key="item.route"
                    :value="item.route"
                    @click="clickHandler(item)"
                    :color="theme.name.value === AppThemeSelection.light ? 'primary' : 'info'"
                    :active="$route.path === item.route"
                  >
                    <template v-slot:prepend v-if="item.icon">
                      <v-img
                        v-if="item.icon.includes('.')"
                        class="mr-7"
                        width="24"
                        :src="baseUrl + 'images/icons/' + item.icon"
                        :alt="item.title"
                      />
                      <v-icon v-else width="26">{{ item.icon }}</v-icon>
                    </template>

                    <v-list-item-title class="font-weight-bold">
                      <v-tooltip :text="item.tooltip" :disabled="!item.tooltip">
                        <template #activator="{ props }">
                          <span v-bind="props">
                            {{ item.title }}
                          </span>
                        </template>
                      </v-tooltip>
                    </v-list-item-title>
                  </v-list-item>
                </v-list-group>
                <v-list-item
                  v-else
                  v-for="item in route.items"
                  :key="item.route"
                  :value="item.route"
                  @click="clickHandler(item)"
                  :active="$route.path === item.route"
                  :color="theme.name.value === AppThemeSelection.light ? 'primary' : 'info'"
                >
                  <template v-slot:prepend v-if="item.icon">
                    <v-img
                      v-if="item.icon.includes('.')"
                      class="mr-7"
                      width="24"
                      :src="baseUrl + 'images/icons/' + item.icon"
                      :alt="item.title"
                    />
                    <v-icon v-else width="26">{{ item.icon }}</v-icon>
                  </template>

                  <v-list-item-title class="font-weight-bold">
                    <v-tooltip :text="item.tooltip" :disabled="!item.tooltip">
                      <template #activator="{ props }">
                        <span v-bind="props">
                          {{ item.title }}
                        </span>
                      </template>
                    </v-tooltip>
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </div>
        </div>

        <template v-if="version">
          <div class="version">
            <v-chip color="secondary">
              {{ version }}
            </v-chip>
          </div>
        </template>
      </v-navigation-drawer>

      <v-main :style="{ paddingTop: navbarConfig ? '140px' : '70px' }">
        <v-toolbar class="border position-fixed pr-2" :style="{ zIndex: 1100, top: 0, left: 0, right: 0 }">
          <v-toolbar-title class="custom-toolbar-title">
            <v-img
              :src="`${
                theme.name.value === AppThemeSelection.light
                  ? baseUrl + 'images/logoTF_dark.png'
                  : baseUrl + 'images/logoTF_light.png'
              }`"
              width="160px"
              @click="navigateToHome"
              class="clickable-logo"
            />
          </v-toolbar-title>

          <v-spacer>
            <div class="d-flex align-center justify-start">
              <TfSwapPrice>
                <FundsCard v-if="hasActiveProfile" />
              </TfSwapPrice>
            </div>
          </v-spacer>
          <v-btn class="capitalize" color="anchor" :style="{ pointerEvents: 'none' }" variant="text">
            {{ network }}net
          </v-btn>
          <v-divider vertical class="mx-2" />
          <AppTheme />
          <v-divider vertical class="mx-2" />
          <ProfileManager v-model="openProfile" />
        </v-toolbar>

        <v-toolbar
          v-if="navbarConfig && hasActiveProfile"
          :color="theme.name.value === AppThemeSelection.dark ? '#121212' : 'background'"
          class="border position-fixed py-0 d-flex pr-2"
          :style="{
            zIndex: 1005,
            top: '65.5px',
            right: 0,
            width: openSidebar && hasActiveProfile ? 'calc(100% - 280px)' : '100%',
          }"
          height="50"
        >
          <v-row>
            <v-breadcrumbs class="ma-3" :items="navbarConfig.path">
              <template v-slot:divider>
                <v-icon icon="mdi-chevron-right"></v-icon>
              </template>
              <template v-slot:item="{ item }">
                <component
                  :is="item.to ? 'router-link' : 'span'"
                  :to="item.to"
                  :class="{ 'text-secondary text-decoration-none': !!item.to }"
                >
                  {{ item.title }}
                </component>
              </template>
            </v-breadcrumbs>
          </v-row>
        </v-toolbar>

        <DeploymentListManager>
          <v-container
            fluid
            :style="{
              paddingBottom: '0px',
              minHeight: '85%',
              maxHeight: '100%',
            }"
          >
            <div class="d-flex align-center">
              <v-btn
                v-if="!openSidebar"
                color="secondary"
                @click="openSidebar = true"
                icon="mdi-menu"
                variant="tonal"
                class="mr-2 mb-4"
              />
            </div>

            <TfRouterView @openProfile="openProfile = true" :isAuth="hasActiveProfile && hasGrid" />
          </v-container>
        </DeploymentListManager>
        <TFNotification v-if="hasActiveProfile && hasGrid" />
        <TfLogger />
        <MainFooter />
      </v-main>
    </profile-manager-controller>
  </v-app>
</template>

<script lang="ts" setup>
import noop from "lodash/fp/noop.js";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTheme } from "vuetify";

import TfLogger from "@/components/logger.vue";

import { useProfileManager } from "./stores/profile_manager";
const $route = useRoute();
const $router = useRouter();
const profileManager = useProfileManager();
const gridStore = useGrid();
const network = process.env.NETWORK || (window as any).env.NETWORK;

const openProfile = ref(true);
const hasActiveProfile = computed(() => !!profileManager.profile);
const theme = useTheme();
const navbarConfig = ref();

const hasGrid = computed(() => !!gridStore.grid);

// eslint-disable-next-line no-undef
const permanent = ref(window.innerWidth > 980);
const openSidebar = ref(permanent.value);

function setSidebarOnResize() {
  permanent.value =
    window.innerWidth >
    ($route.meta && "sidebarBreakpoint" in $route.meta && typeof $route.meta["sidebarBreakpoint"] === "number"
      ? $route.meta.sidebarBreakpoint
      : 980);
  openSidebar.value = permanent.value;
}

window.addEventListener("resize", setSidebarOnResize);

watch(
  () => $route.meta,
  meta => {
    (document.title = "Threefold Dashboard" + (meta && "title" in meta ? ` | ${meta.title}` : ``)),
      (navbarConfig.value = meta.navbarConfig);

    setSidebarOnResize();
  },
);
function navigateToHome() {
  return $router.push(DashboardRoutes.Other.HomePage);
}

onMounted(window.$$appLoader || noop);

// eslint-disable-next-line no-undef
const version = process.env.VERSION as any;

const routes: AppRoute[] = [
  {
    title: "TFGrid",
    icon: "mdi-database-search-outline",

    items: [
      {
        title: "Grid Status",
        icon: "mdi-grid-large",
        url: DashboardRoutes.TFGrid.GridStatus,
        tooltip: "Status of Threefold Grid.",
      },
      {
        title: "Node Statistics",
        icon: "mdi-chart-scatter-plot",
        route: DashboardRoutes.TFGrid.NodeStatistics,
        tooltip: "View Node Statistics.",
      },
      {
        title: "Node Monitoring",
        icon: "mdi-equalizer",
        url: DashboardRoutes.TFGrid.NodeMonitoring,
        tooltip: "Monitor Zero-OS Nodes.",
      },
    ],
  },
  {
    title: "Deploy",
    icon: "mdi-silo",
    items: [
      {
        title: "Pricing Calculator",
        icon: "mdi-currency-usd",
        route: DashboardRoutes.Deploy.PricingCalculator,
        tooltip: "Calculate the cost of your deployments.",
      },
      {
        title: "Node Finder",
        icon: "mdi-access-point",
        route: DashboardRoutes.Deploy.NodeFinder,
        tooltip: "Find nodes on the ThreeFold grid.",
      },

      {
        title: "Virtual Machines",
        icon: "mdi-television",
        route: DashboardRoutes.Deploy.VirtualMachines,
        tooltip: "Deploy your Virtal Machine instances.",
      },
      {
        title: "Orchestrators",
        icon: "mdi-group",
        route: DashboardRoutes.Deploy.Orchestrators,
        tooltip: "Deploy your orchestrator instances.",
      },
      {
        title: "Applications",
        icon: "mdi-lightbulb-on-outline",
        route: DashboardRoutes.Deploy.Applications,
        tooltip: "Deploy ready applications on the ThreeFold grid.",
      },
      {
        title: "Your Contracts",
        icon: "mdi-file-document-edit",
        route: DashboardRoutes.Deploy.YourContracts,
        tooltip: "Explore and modify your TFChain contracts.",
      },
      {
        title: "Images",
        icon: "mdi-open-in-new",
        url: DashboardRoutes.Deploy.Images,
        tooltip: "Find or Publish your Flist on 0-Hub.",
      },
      {
        title: "SSH Keys",
        icon: "mdi-key-plus",
        route: DashboardRoutes.Deploy.SSHKey,
        tooltip: "Generate or update your SSH Keys.",
      },
    ],
  },
  {
    title: "Farms",
    icon: "mdi-access-point",
    items: [
      {
        title: "Your Farms",
        icon: "mdi-silo",
        route: DashboardRoutes.Farms.YourFarms,
        tooltip: "Create and manage farms and nodes.",
      },
      {
        title: "Farm Finder",
        icon: "mdi-lan-connect",
        route: DashboardRoutes.Farms.FarmFinder,
        tooltip: "Find farms on the ThreeFold grid.",
      },
      {
        title: "Node Installer",
        icon: "mdi-earth",
        url: DashboardRoutes.Farms.NodeInstaller,
        tooltip: "Download Zero-OS Images.",
      },
      {
        title: "Simulator",
        icon: "mdi-chart-line",
        route: DashboardRoutes.Farms.Simulator,
        tooltip: "Calculate and Simulate your farming rewards.",
      },
    ],
  },
  {
    title: "TFChain",
    icon: "mdi-account-convert-outline",
    items: [
      {
        title: "Your Profile",
        icon: "mdi-account-supervisor-outline",
        route: DashboardRoutes.TFChain.YourProfile,
        tooltip: "Check your profile details.",
      },
      {
        title: "TF DAO",
        icon: "mdi-note-check-outline",
        route: DashboardRoutes.TFChain.TFDAO,
        tooltip: "Check and vote on DAO proposals.",
      },
      {
        title: "TF Token Bridge",
        icon: "mdi-swap-horizontal",
        route: DashboardRoutes.TFChain.TFTokenBridge,
        tooltip: "Transfer TFTs on different chains.",
      },
      {
        title: "TF Token Transfer",
        icon: "mdi-account-arrow-right-outline",
        route: DashboardRoutes.TFChain.TFTokenTransfer,
        tooltip: "Transfer TFTs on TFChain.",
      },
      {
        title: "TF Minting Reports",
        icon: "mdi-file-document-edit",
        route: DashboardRoutes.TFChain.TFMintingReports,
        tooltip: "TFGrid Minting Explorer.",
      },
    ],
  },
  {
    title: "Manual",
    items: [
      {
        title: "Manual",
        icon: "mdi-book-open-page-variant-outline",
        url: DashboardRoutes.Other.Manual,
        tooltip: "ThreeFold Manual.",
      },
    ],
  },
];

const baseUrl = import.meta.env.BASE_URL;

function clickHandler({ route, url }: AppRouteItem): void {
  if (route) {
    $router.push(route);
  } else if (url) {
    window.open(url, "_blank");
  }
}
</script>

<script lang="ts">
import { DashboardRoutes } from "@/router/routes";
import { AppThemeSelection } from "@/utils/app_theme";

import AppTheme from "./components/app_theme.vue";
import DeploymentListManager from "./components/deployment_list_manager.vue";
import FundsCard from "./components/funds_card.vue";
import MainFooter from "./components/main_footer.vue";
import ProfileManagerController from "./components/profile_manager_controller.vue";
import TFNotification from "./components/tf_notification.vue";
import TfNavigationLoader from "./components/TfNavigationLoader.vue";
import TfOfflineNotifier from "./components/TfOfflineNotifier.vue";
import TfRouterView from "./components/TfRouterView.vue";
import TfSwapPrice from "./components/TfSwapPrice.vue";
import { useGrid } from "./stores";
import ProfileManager from "./weblets/profile_manager.vue";

interface AppRoute {
  title: string;
  items: AppRouteItem[];
  icon?: string;
  tooltip?: string;
}

interface AppRouteItem {
  title: string;
  route?: string;
  url?: string;
  icon?: string;
  tooltip?: string;
}

export default {
  name: "App",
  components: {
    TFNotification,
    ProfileManager,
    DeploymentListManager,
    AppTheme,
    TfRouterView,
    TfSwapPrice,
    FundsCard,
    ProfileManagerController,
    TfNavigationLoader,
    TfOfflineNotifier,
    MainFooter,
  },
  data: () => ({
    icons: ["mdi-github", "mdi-email-outline"],
  }),
};
</script>

<style>
.clickable-logo:hover {
  cursor: pointer;
}
.v-theme--light .v-btn--disabled,
.v-theme--dark .v-btn--disabled,
.v-theme--light .v-field--disabled {
  opacity: 0.5 !important;
  pointer-events: none !important;
}
.v-theme--light .v-field--disabled {
  background-color: #f0f0f0 !important;
}
.v-theme--light .v-btn--disabled,
.v-theme--dark .v-btn--disabled {
  color: #7b7b7b !important;
}
body {
  overflow: auto;
  height: 100vh;
}

html {
  overflow: hidden;
}
</style>
