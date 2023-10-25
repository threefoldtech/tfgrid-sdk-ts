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
              <v-list-subheader>{{ route.title }}</v-list-subheader>
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
                    class="mr-4"
                    width="26"
                    :src="baseUrl + 'images/icons/' + item.icon"
                    :alt="item.title"
                  />
                  <v-icon v-else>{{ item.icon }}</v-icon>
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

        <v-btn
          v-for="(link, index) in navbarLinks"
          :key="index"
          color="var(--link-color)"
          variant="text"
          target="_blank"
          :href="link.url"
          :prepend-icon="link.icon && link.label ? link.icon : undefined"
          :icon="link.icon && !link.label ? link.icon : undefined"
          :text="link.label"
        />
        <v-divider vertical v-if="navbarLinks.length" />
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
    title: "Deployments",
    items: [
      { title: "Full Virtual Machine", icon: "vm.png", route: "/" },
      { title: "Micro Virtual Machine", icon: "vm.png", route: "/vm" },
      { title: "Kubernetes", icon: "kubernetes.png", route: "/kubernetes" },
      { title: "CapRover", icon: "caprover.png", route: "/caprover" },
      { title: "Peertube", icon: "peertube.png", route: "/peertube" },
      { title: "Funkwhale", icon: "funkwhale.png", route: "/funkwhale" },
      { title: "Mattermost", icon: "mattermost.png", route: "/mattermost" },
      { title: "Discourse", icon: "discourse.png", route: "/discourse" },
      { title: "Taiga", icon: "taiga.png", route: "/taiga" },
      { title: "Owncloud", icon: "owncloud.png", route: "/owncloud" },
      // { title: "Nextcloud", icon: "nextcloud.png", route: "/nextcloud" },
      { title: "Presearch", icon: "presearch.png", route: "/presearch" },
      { title: "Subsquid", icon: "subsquid.png", route: "/subsquid" },
      { title: "Casperlabs", icon: "casperlabs.png", route: "/casperlabs" },
      { title: "Algorand", icon: "algorand.png", route: "/algorand" },
      { title: "Node Pilot", icon: "vm.png", route: "/nodepilot" },
      { title: "Wordpress", icon: "wordpress.png", route: "/wordpress" },
      { title: "Umbrel", icon: "umbrel.png", route: "/umbrel" },
      // { title: "Freeflow", icon: "freeflow.png", route: "/freeflow" },
    ],
  },
  {
    title: "My Account",
    items: [{ title: "Contracts", route: "/contractslist" }],
  },
  {
    title: "Help",
    items: [{ title: "Manual", icon: "mdi-open-in-new", url: "https://manual.grid.tf/" }],
  },
];

const navbarLinks: NavbarLink[] = [
  {
    label: "Help",
    url: "https://manual.grid.tf/",
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

.custom-toolbar-title {
  max-width: 17rem !important;
}
.mosha__toast__content-wrapper {
  margin-bottom: -2px;
}
.mosha__icon {
  margin-right: 6px !important;
  margin-top: 2px;
}

.mosha__icon__dark__warning {
  fill: #ffcc00 !important;
}

.mosha__icon__light__warning {
  fill: #fb8c00 !important;
}

.mosha__toast__content.dark__warning {
  color: #ffcc00;
}

.mosha__toast__content.light__warning {
  color: #fb8c00;
}

.mosha__toast__close-icon.dark__warning::before {
  color: #ffcc00 !important;
}

.mosha__toast__close-icon.light__warning::before {
  color: #fb8c00 !important;
}

.mosha__toast__content__text {
  font-size: 14px !important;
}
</style>
