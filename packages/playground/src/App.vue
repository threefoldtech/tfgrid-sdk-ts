<template>
  <v-app>
    <v-navigation-drawer width="280" :permanent="permanent" v-model="openSidebar" theme="dark">
      <v-list>
        <v-list-item>
          <v-img :src="baseUrl + 'images/logoTF.png'" />
        </v-list-item>
        <v-list-item>
          <v-card color="primary" variant="tonal">
            <v-card-title class="text-center capitalize">{{ network }}net</v-card-title>
          </v-card>
        </v-list-item>

        <v-list-item class="justify-center">
          <AppTheme />
        </v-list-item>

        <template v-for="route in routes" :key="route.title">
          <v-list-subheader>{{ route.title }}</v-list-subheader>
          <v-list-item
            v-for="item in route.items"
            :key="item.route"
            :value="item.route"
            @click="$router.push(item.route)"
            active-color="primary"
            :active="$route.path === item.route"
          >
            <template v-slot:prepend v-if="item.icon">
              <v-img class="mr-4" width="26" :src="baseUrl + 'images/icons/' + item.icon" :alt="item.title" />
            </template>

            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>

      <template v-if="version">
        <div class="version">
          <v-chip color="primary">
            {{ version }}
          </v-chip>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <DeploymentListManager>
        <v-container fluid>
          <div class="d-flex align-center">
            <v-btn
              color="primary"
              @click="openSidebar = true"
              icon="mdi-menu"
              variant="tonal"
              class="mr-2"
              v-if="!permanent"
            />
            <div :style="{ width: '100%' }">
              <DisclaimerToolbar />
            </div>
          </div>
          <div class="my-4 d-flex justify-end">
            <ProfileManager />
          </div>
          <div :style="{ position: 'relative' }">
            <router-view v-slot="{ Component }">
              <transition name="fade">
                <div :key="$route.path">
                  <component :is="Component"></component>
                </div>
              </transition>
            </router-view>
          </div>
        </v-container>
      </DeploymentListManager>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const $route = useRoute();
const $router = useRouter();
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
      { title: "Presearch", icon: "presearch.png", route: "/presearch" },
      { title: "Subsquid", icon: "subsquid.png", route: "/subsquid" },
      { title: "Casperlabs", icon: "casperlabs.png", route: "/casperlabs" },
      { title: "Algorand", icon: "algorand.png", route: "/algorand" },
      { title: "Node Pilot", icon: "vm.png", route: "/nodepilot" },
      { title: "Wordpress", icon: "wordpress.png", route: "/wordpress" },
      { title: "Umbrel", icon: "umbrel.png", route: "/umbrel" },
    ],
  },
  {
    title: "My Account",
    items: [
      { title: "Contracts", route: "/contractslist" },
      { title: "Deployments", route: "/deployedlist" },
    ],
  },
];

// eslint-disable-next-line no-undef
const network = process.env.NETWORK as string;

const permanent = window.innerWidth > 980;
const openSidebar = ref(permanent);

const baseUrl = import.meta.env.BASE_URL;
</script>

<script lang="ts">
import AppTheme from "./components/app_theme.vue";
import DeploymentListManager from "./components/deployment_list_manager.vue";
import DisclaimerToolbar from "./components/disclaimer_toolbar.vue";
import ProfileManager from "./weblets/profile_manager.vue";

interface AppRoute {
  title: string;
  items: AppRouteItem[];
}

interface AppRouteItem {
  title: string;
  route: string;
  icon?: string;
}
export default {
  name: "App",
  components: {
    DisclaimerToolbar,
    ProfileManager,
    DeploymentListManager,
    AppTheme,
  },
};
</script>

<style lang="scss" global>
.app-link {
  text-decoration: none;
  font-weight: bold;
  color: #3d7ad4;
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
  bottom: 0;
  right: 7%;
}
</style>
