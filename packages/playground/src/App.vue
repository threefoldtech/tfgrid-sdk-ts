<template>
  <v-app>
    <v-navigation-drawer
      width="280"
      :permanent="permanent"
      :model-value="hasActiveProfile && openSidebar"
      @update:model-value="openSidebar = $event"
      theme="dark"
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
                  <v-list-item v-bind="props" :prepend-icon="route.icon" :title="route.title"></v-list-item>
                </template>
                <v-list-item
                  v-for="item in route.items"
                  :key="item.route"
                  :value="item.route"
                  @click="clickHandler(item)"
                  active-color="primary"
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

                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list-group>
              <v-list-item
                v-else
                v-for="item in route.items"
                :key="item.route"
                :value="item.route"
                @click="clickHandler(item)"
                active-color="primary"
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

                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </template>
          </v-list>
        </div>
      </div>

      <template v-if="version">
        <div class="version">
          <v-chip color="primary">
            {{ version }}
          </v-chip>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main :style="{ paddingTop: '70px' }">
      <v-toolbar
        color="rgb(49, 49, 49)"
        class="position-fixed pr-2"
        theme="dark"
        :style="{ zIndex: 1005, top: 0, left: 0, right: 0 }"
      >
        <v-toolbar-title>
          <v-img :src="baseUrl + 'images/logoTF.png'" width="160px" />
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn class="capitalize" :style="{ pointerEvents: 'none' }" variant="text"> {{ network }}net </v-btn>
        <v-divider vertical class="mx-2" />
        <AppTheme />
        <v-divider vertical class="mx-2" />
        <ProfileManager v-model="openProfile" />
      </v-toolbar>

      <DeploymentListManager>
        <v-container fluid :style="{ paddingBottom: '100px' }">
          <div class="d-flex align-center">
            <v-btn
              color="primary"
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
                  <component :is="Component" v-if="hasActiveProfile"></component>
                  <ConnectWalletLanding @openProfile="openProfile = true" v-else />
                </div>
              </transition>
            </router-view>
          </div>
        </v-container>
      </DeploymentListManager>
      <TFNotification v-if="hasActiveProfile" />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useProfileManager } from "./stores/profile_manager";

const $route = useRoute();
const $router = useRouter();
const profileManager = useProfileManager();

const openProfile = ref(true);
const hasActiveProfile = computed(() => !!profileManager.profile);

watch(
  () => $route.meta,
  meta => (document.title = "TF Playground" + (meta && "title" in meta ? ` | ${meta.title}` : ``)),
);

// eslint-disable-next-line no-undef
const version = process.env.VERSION as any;

const routes: AppRoute[] = [
  {
    title: "Playground",
    items: [{ title: "Deployments", icon: "vm.png", route: "/" }],
  },
  {
    title: "My Account",
    items: [{ title: "Contracts", icon: "mdi-file-document-edit", route: "/contractslist" }],
  },
  {
    title: "Portal",
    icon: "mdi-account-convert-outline",
    items: [
      { title: "Twin", icon: "mdi-account-supervisor-outline", route: "/twin" },
      { title: "Bridge", icon: "mdi-swap-horizontal", route: "/bridge" },
      { title: "Transfer", icon: "mdi-account-arrow-right-outline", route: "/transfer" },
      { title: "Farms", icon: "mdi-silo", route: "/my-farms" },
      { title: "Dedicated Nodes", icon: "mdi-resistor-nodes", route: "/dedicated-nodes" },
      { title: "DAO", icon: "mdi-note-check-outline", route: "/dao" },
    ],
  },
  {
    title: "Explorer",
    icon: "mdi-database-search-outline",
    items: [
      { title: "Statistics", icon: "mdi-chart-scatter-plot", route: "/stats" },
      { title: "Nodes", icon: "mdi-access-point", route: "/nodes" },
      { title: "Farms", icon: "mdi-lan-connect", route: "/farms" },
    ],
  },
  {
    title: "Calculators",
    icon: "mdi-calculator",
    items: [
      { title: "Resource Pricing", icon: "mdi-currency-usd", route: "pricing" },
      { title: "Simulator", icon: "mdi-chart-line", route: "/simulator" },
    ],
  },
  {
    title: "Other Services",
    icon: "mdi-toolbox",
    items: [
      {
        title: "Graphana",
        icon: "mdi-equalizer",
        url: "https://metrics.grid.tf/d/rYdddlPWkfqwf/zos-host-metrics?orgId=2&refresh=30s",
      },
      {
        title: "Zero-Os Bootstrap",
        icon: "mdi-earth",
        url: "https://bootstrap.grid.tf/",
      },
      {
        title: "0-Hub",
        icon: "mdi-open-in-new",
        url: "https://hub.grid.tf/",
      },
    ],
  },
  {
    title: "Help",
    items: [{ title: "Manual", icon: "mdi-book-open-page-variant-outline", url: "https://manual.grid.tf/" }],
  },
];

// eslint-disable-next-line no-undef
const network = process.env.NETWORK || (window as any).env.NETWORK;

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
</script>

<script lang="ts">
import AppInfo from "./components/app_info.vue";
import AppTheme from "./components/app_theme.vue";
import ConnectWalletLanding from "./components/connect_wallet_landing.vue";
import DeploymentListManager from "./components/deployment_list_manager.vue";
import DisclaimerToolbar from "./components/disclaimer_toolbar.vue";
import TFNotification from "./components/tf_notification.vue";
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

interface NavbarLink {
  label?: string;
  url: string;
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
  },
};
</script>

<style lang="scss" global>
:root {
  --link-color: #3d7ad4;
}

.app-link {
  text-decoration: none;
  font-weight: bold;
  color: var(--link-color);
  cursor: pointer;
}

.fade-leave-active,
.fade-enter-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;

  transition: opacity 1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.capitalize {
  text-transform: capitalize !important;
}

.v-btn {
  text-transform: capitalize !important;
  font-size: 1rem !important;
}

.version {
  position: absolute;
  bottom: 15px;
  right: 25px;
}
.v-tooltip > .v-overlay__content {
  opacity: 10;
  color: white;
  font-weight: 900;
  background-color: rgb(71, 70, 70);
}

a {
  color: #5695ff !important;
}

.v-list-item__prepend {
  width: 35px !important;
}

.v-list-item--density-default.v-list-item--one-line {
  min-height: 40px;
}
</style>
