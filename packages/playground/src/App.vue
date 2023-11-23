<template>
  <v-app>
    <profile-manager-controller>
      <v-navigation-drawer
        width="280"
        :permanent="permanent"
        :model-value="hasActiveProfile && openSidebar"
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
                      <v-list-item-title class="font-weight-bold">{{ route.title }}</v-list-item-title>
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

                    <v-list-item-title class="font-weight-bold">{{ item.title }}</v-list-item-title>
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

                  <v-list-item-title class="font-weight-bold">{{ item.title }}</v-list-item-title>
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
        <v-toolbar class="border position-fixed pr-2" :style="{ zIndex: 1005, top: 0, left: 0, right: 0 }">
          <v-toolbar-title class="custom-toolbar-title">
            <v-img
              :src="`${
                theme.name.value === AppThemeSelection.light
                  ? baseUrl + 'images/logoTF_dark.png'
                  : baseUrl + 'images/logoTF_light.png'
              }`"
              width="160px"
            />
          </v-toolbar-title>

          <v-spacer>
            <div class="d-flex align-center justify-start">
              <TftSwapPrice class="pr-4"></TftSwapPrice>
              <FundsCard v-if="hasActiveProfile"></FundsCard>
            </div>
          </v-spacer>
          <v-btn class="capitalize" :style="{ pointerEvents: 'none' }" variant="text"> {{ network }}net </v-btn>
          <v-divider vertical class="mx-2" />
          <AppTheme />
          <v-divider vertical class="mx-2" />
          <ProfileManager v-model="openProfile" />
        </v-toolbar>

        <v-toolbar
          v-if="navbarConfig"
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
          <v-container>
            <v-row>
              <v-breadcrumbs :items="navbarConfig.path" active-color="secondary">
                <template v-slot:divider>
                  <v-icon icon="mdi-chevron-right"></v-icon>
                </template>
                <template v-slot:item="{ item }">
                  <router-link :to="item.to" :class="{ 'clickable-item': !item.disabled }">
                    {{ item.title }}
                  </router-link>
                </template>
              </v-breadcrumbs>
            </v-row>
          </v-container>
        </v-toolbar>

        <DeploymentListManager>
          <v-container fluid :style="{ paddingBottom: '100px' }">
            <div class="d-flex align-center">
              <v-btn
                color="secondary"
                @click="openSidebar = true"
                icon="mdi-menu"
                variant="tonal"
                class="mr-2"
                :disabled="!hasActiveProfile"
                v-if="!permanent"
              />
              <div :style="{ width: '100%' }" class="mb-4">
                <DisclaimerToolbar />
              </div>
            </div>

            <div :style="{ position: 'relative' }">
              <router-view v-slot="{ Component }">
                <transition name="fade">
                  <div :key="$route.path">
                    <component :is="Component" v-if="hasActiveProfile && hasGrid"></component>
                    <ConnectWalletLanding @openProfile="openProfile = true" v-else />
                  </div>
                </transition>
              </router-view>
            </div>
          </v-container>
        </DeploymentListManager>
        <TFNotification v-if="hasActiveProfile" />
      </v-main>
    </profile-manager-controller>
  </v-app>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTheme } from "vuetify";

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
watch(
  () => $route.meta,
  meta => {
    (document.title = "TF Playground" + (meta && "title" in meta ? ` | ${meta.title}` : ``)),
      (navbarConfig.value = meta.navbarConfig);
  },
);

onMounted(() => {
  (window as any).loaded = true;
});

// eslint-disable-next-line no-undef
const version = process.env.VERSION as any;

const routes: AppRoute[] = [
  {
    title: "Dashboard",
    icon: "mdi-account-convert-outline",
    items: [
      {
        title: "Twin",
        icon: "mdi-account-supervisor-outline",
        route: "/dashboard/twin",
      },
      { title: "Bridge", icon: "mdi-swap-horizontal", route: "/dashboard/bridge" },
      {
        title: "Transfer",
        icon: "mdi-account-arrow-right-outline",
        route: "/dashboard/transfer",
      },
      { title: "Farms", icon: "mdi-silo", route: "/dashboard/farms" },
      {
        title: "Dedicated Nodes",
        icon: "mdi-resistor-nodes",
        route: "/dashboard/dedicated-nodes",
      },
      { title: "DAO", icon: "mdi-note-check-outline", route: "/dashboard/dao" },
    ],
  },
  {
    icon: "mdi-database-search-outline",
    title: "Explorer",
    items: [
      {
        title: "Statistics",
        icon: "mdi-chart-scatter-plot",
        route: "/explorer/stats",
      },
      { title: "Nodes", icon: "mdi-access-point", route: "/explorer/nodes" },
      { title: "Farms", icon: "mdi-lan-connect", route: "/explorer/farms" },
    ],
  },
  {
    icon: "mdi-toolbox-outline",
    title: "Services",
    items: [
      {
        title: "0-Hub",
        icon: "mdi-open-in-new",
        url: "https://hub.grid.tf/",
      },
      {
        title: "Monitoring",
        icon: "mdi-equalizer",
        url: "https://metrics.grid.tf/d/rYdddlPWkfqwf/zos-host-metrics?orgId=2&refresh=30s",
      },
      {
        title: "0-Bootstrap",
        icon: "mdi-earth",
        url: "https://bootstrap.grid.tf/",
      },
      {
        title: "Grid Services",
        icon: "mdi-grid-large",
        url: "https://status.grid.tf/status/threefold",
      },
      {
        title: "Manual",
        icon: "mdi-book-open-page-variant-outline",
        url: "https://manual.grid.tf/",
      },
    ],
  },
  {
    title: "Calculators",
    icon: "mdi-calculator",
    items: [
      {
        title: "Pricing Calculator",
        icon: "mdi-currency-usd",
        route: "/calculator/pricing",
      },
      {
        title: "Simulator",
        icon: "mdi-chart-line",
        route: "/calculator/simulator",
      },
    ],
  },
  {
    title: "Playground",
    items: [{ title: "Solutions", icon: "mdi-lightbulb-on-outline", route: "/solutions" }],
  },
  {
    title: "My Account",
    items: [
      {
        title: "Contracts",
        icon: "mdi-file-document-edit",
        route: "/contractslist",
      },
    ],
  },
  ...(network !== "main"
    ? []
    : [
        {
          title: "Minting",
          items: [
            {
              title: "Minting",
              icon: "mdi-file-document-edit",
              route: "/minting",
            },
          ],
        } as any,
      ]),
];

// eslint-disable-next-line no-undef
const permanent = window.innerWidth > 980;
const openSidebar = ref(permanent);

const baseUrl = import.meta.env.BASE_URL;

function clickHandler({ route, url }: AppRouteItem): void {
  if (route) {
    $router.push(route);
  } else if (url) {
    window.open(url, "_blank");
  }
}

$router.beforeEach((to, from, next) => {
  if (to.path === "/" && hasActiveProfile) {
    next({ path: "dashboard/twin" });
  } else {
    next();
  }
  window.scrollTo(0, 0);
});
</script>

<script lang="ts">
import { AppThemeSelection } from "@/utils/app_theme";

import AppInfo from "./components/app_info.vue";
import AppTheme from "./components/app_theme.vue";
import ConnectWalletLanding from "./components/connect_wallet_landing.vue";
import DeploymentListManager from "./components/deployment_list_manager.vue";
import DisclaimerToolbar from "./components/disclaimer_toolbar.vue";
import FundsCard from "./components/funds_card.vue";
import ProfileManagerController from "./components/profile_manager_controller.vue";
import TftSwapPrice from "./components/swap_price.vue";
import TFNotification from "./components/tf_notification.vue";
import { useGrid } from "./stores";
import ProfileManager from "./weblets/profile_manager.vue";

interface AppRoute {
  title: string;
  items: AppRouteItem[];
  icon?: string;
}

interface AppRouteItem {
  title: string;
  route?: string;
  url?: string;
  icon?: string;
}

export default {
  name: "App",
  components: {
    TFNotification,
    DisclaimerToolbar,
    ProfileManager,
    DeploymentListManager,
    AppTheme,
    ConnectWalletLanding,
    AppInfo,
    TftSwapPrice,
    FundsCard,
    ProfileManagerController,
  },
};
</script>
