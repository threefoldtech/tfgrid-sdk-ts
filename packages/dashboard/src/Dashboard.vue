<template>
  <v-app>
    <div>
      <v-app-bar color="#064663" dense dark fixed height="65">
        <v-app-bar-nav-icon></v-app-bar-nav-icon>

        <v-toolbar-title class="font-weight-bold" @click="redirectToHomePage" style="cursor: pointer"
          >Threefold Chain</v-toolbar-title
        >

        <v-spacer></v-spacer>
        <div class="d-flex">
          <FundsCard v-if="$store.state.credentials.initialized && $store.state.credentials.balance" />
          <div class="d-flex" style="align-items: center">
            <v-btn icon @click="toggle_dark_mode">
              <v-icon>mdi-theme-light-dark</v-icon>
            </v-btn>

            <v-card color="transparent" outlined v-if="$store.state.portal.accounts.length === 0">
              <v-btn @click="$store.dispatch('portal/subscribeAccounts')" color="green"> Connect </v-btn>
            </v-card>

            <v-btn v-else @click="disconnectWallet" color="red"> Disconnect </v-btn>

            <v-theme-provider root>
              <v-card v-if="filteredAccounts().length" style="width: max-content">
                <v-card-text
                  style="padding: 10px 0px 10px 30px"
                  v-for="account in filteredAccounts()"
                  :key="account.address"
                >
                  <v-row class="d-flex align-center mx-0">
                    <p class="font-weight-black" style="font-size: 15px">{{ account.meta.name }}</p>

                    <v-btn icon class="mr-2" @click="redirectToHomePage">
                      <v-icon>mdi-logout theme-light-dark</v-icon>
                    </v-btn>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-theme-provider>
          </div>
        </div>
      </v-app-bar>
    </div>

    <v-navigation-drawer
      app
      color="#333"
      class="white--text"
      permanent
      v-model="drawer"
      width="300"
      :mini-variant.sync="mini"
    >
      <v-list>
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <v-img src="./assets/logo.png"></v-img>
          </v-list-item-avatar>

          <v-list-item-title class="white--text" @click="redirectToHomePage" style="cursor: pointer"
            >Threefold Chain</v-list-item-title
          >

          <v-btn icon @click.stop="toggle()">
            <v-icon class="white--text">mdi-chevron-left</v-icon>
          </v-btn>
        </v-list-item>
        <v-divider></v-divider>
        <template v-for="route in routes">
          <v-list-item
            v-if="!route.children.length"
            :class="{ 'mr-2 ml-2': !mini }"
            :key="route.label"
            :to="route.hyperlink ? undefined : route.prefix"
            @click="route.hyperlink ? openLink(route.prefix) : undefined"
          >
            <v-list-item-icon>
              <v-icon class="white--text" v-text="'mdi-' + route.icon" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="white--text">
                <strong>
                  {{ route.label }}
                </strong>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-group
            v-else
            :active="route.active"
            :key="'V-' + route.label"
            v-model="route.active"
            class="white--text"
            @click="onPortalActivateAccount(route)"
            :style="mini ? '' : 'margin: 10px !important;'"
          >
            <template v-slot:activator>
              <v-list-item-icon>
                <v-icon class="white--text" v-text="'mdi-' + route.icon" />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="white--text">
                  <strong>
                    {{ route.label }}
                  </strong>
                </v-list-item-title>
              </v-list-item-content>
            </template>

            <div v-if="route.prefix === '/'">
              <template v-if="!$store.state.credentials.initialized">
                <div class="mt-4">
                  <v-alert color="rgb(25, 130, 177)" dense type="info">
                    You should <strong>select/create</strong> an account to enable the portal functionalities.
                  </v-alert>
                </div>
              </template>
              <template v-else>
                <div v-for="account in filteredAccounts()" :key="account.address">
                  <v-list-item
                    :active="account.active"
                    v-for="subchild in route.children"
                    :key="subchild.label"
                    :to="subchild.path"
                    class="white--text pl-16"
                  >
                    <v-list-item-icon>
                      <v-icon class="white--text" v-text="'mdi-' + subchild.icon" />
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="white--text text-capitalize" v-text="subchild.label">
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </template>
            </div>
            <div v-else>
              <v-list-item
                active
                v-for="child in route.children"
                :key="child.label"
                :to="route.prefix + child.path"
                class="pl-16"
              >
                <v-list-item-icon class="mr-4" v-if="child.icon">
                  <v-icon class="white--text" v-text="'mdi-' + child.icon" />
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="white--text" v-text="child.label"> </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </div>
          </v-list-group>
        </template>
      </v-list>
      <div
        :style="
          mini
            ? 'display: none'
            : 'position: fixed; bottom: 2%; right: 7%; background-color: rgb(25, 130, 177); padding: 5px 10px; border-radius: 15px;'
        "
      >
        <span>{{ version ? version : "no version provided" }}</span>
      </div>
    </v-navigation-drawer>
    <v-dialog v-model="loadingAPI" persistent class="loadingDialog">
      <div class="d-flex justify-center" style="display: block; padding: 10%">
        <v-progress-circular indeterminate color="green" :size="335" :width="7">
          <span style="font-size: large; color: black">Connecting to Polkadot</span>
        </v-progress-circular>
      </div>
    </v-dialog>

    <div :style="'padding-left:' + (mini ? '56px' : '300px')">
      <router-view />
    </div>

    <v-footer padless fixed>
      <v-card class="flex" flat tile>
        <v-card-text class="py-2 text-center">
          {{ new Date().getFullYear() }} — <strong>ThreeFoldTech</strong>
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { connect } from "./portal/lib/connect";
import { accountInterface } from "./portal/store/state";
import WelcomeWindow from "./portal/components/WelcomeWindow.vue";
import FundsCard from "./portal/components/FundsCard.vue";
import config from "@/portal/config";

interface SidenavItem {
  label: string;
  icon: string;
  prefix: string;
  active?: boolean;
  hyperlink?: boolean;
  children: Array<{
    label?: string;
    path?: string;
    icon: string;
    active?: boolean;
    showBeforeLogIn: boolean; //i.e loginto the polkadot.js
    children?:
      | Array<{
          label: string;
          path?: string;
          icon: string;
        }>
      | [];
  }>;
}

@Component({
  name: "Dashboard",
  components: { WelcomeWindow, FundsCard },
})
export default class Dashboard extends Vue {
  collapseOnScroll = true;
  mini = true;
  drawer = true;
  $api: any;
  accounts: accountInterface[] = [];
  loadingAPI = true;
  version = config.version;

  async mounted() {
    this.$store.dispatch("portal/subscribeAccounts");
    this.accounts = this.$store.state.portal.accounts;
    if (this.$route.path === "/" && !this.$api) {
      Vue.prototype.$api = await connect();
      if (this.$api) this.$store.commit("portal/setApi", { api: this.$api });
      this.loadingAPI = false;
    }
    const theme = localStorage.getItem("dark_theme");
    if (theme) {
      if (theme === "true") {
        this.$vuetify.theme.dark = true;
      } else {
        this.$vuetify.theme.dark = false;
      }
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      this.$vuetify.theme.dark = true;
      localStorage.setItem("dark_theme", this.$vuetify.theme.dark.toString());
    }
    this.$root.$on("selectAccount", async () => {
      this.routes[0].active = true;
      this.mini = false;
    });

    this.$root.$on("closeSidebar", () => {
      this.mini = !this.mini;
      if (this.mini) {
        const [portal, explorer, calculator] = this.routes;
        portal.active = false;
        explorer.active = false;
        calculator.active = false;
      }
    });
  }

  openLink(url: string): void {
    window.open(url, "_blank");
  }

  onPortalActivateAccount(route: SidenavItem): void | undefined {
    if (this.$route.name !== "accounts" && !this.filteredAccounts().length && route.label === "Portal") {
      return this.redirectToHomePage();
    }
  }

  async updated() {
    this.accounts = this.$store.state.portal.accounts;
    if (this.$api && this.$route.path == "/") {
      this.loadingAPI = false;
    } else if (this.$route.path !== "/") {
      this.loadingAPI = false;
    }
  }

  async unmounted() {
    await this.$api.disconnect();
    this.$store.dispatch("portal/unsubscribeAccounts");
    this.$store.commit("UNSET_CREDENTIALS");
    this.$router.push({
      name: "accounts",
      path: `/`,
    });
  }

  public filteredAccounts() {
    return this.accounts.filter(account => account.active);
  }

  public isAccountSelected() {
    if (this.$store.state.credentials.initialized) {
      return true;
    }
    return false;
  }

  public disconnectWallet() {
    this.$store.dispatch("portal/unsubscribeAccounts");
    if (this.$store.state.credentials.initialized) {
      this.$store.commit("UNSET_CREDENTIALS");
      this.$router.push({
        name: "accounts",
        path: `/`,
      });
    }
  }

  public redirectToHomePage() {
    this.accounts.map(account => (account.active = false));
    this.$store.commit("UNSET_CREDENTIALS");
    this.routes[0].active = false;
    if (this.$route.path !== "/") {
      this.$router.push({
        name: "accounts",
        path: "/",
      });
    }
  }

  public toggle_dark_mode() {
    this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    localStorage.setItem("dark_theme", this.$vuetify.theme.dark.toString());
  }

  routes: SidenavItem[] = [
    {
      //label and path will be retrieved from accounts fetched from store (polkadot)
      label: "Portal",
      icon: "account-convert-outline",
      prefix: "/",
      active: this.mini ? false : true,
      children: [
        {
          label: "twin",
          path: "account-twin",
          icon: "account-supervisor-outline",
          showBeforeLogIn: false,
        },
        {
          label: "bridge",
          path: "account-swap",
          icon: "swap-horizontal",
          showBeforeLogIn: false,
        },
        {
          label: "transfer",
          path: "account-transfer",
          icon: "account-arrow-right-outline",
          showBeforeLogIn: false,
        },
        { label: "farms", path: "account-farms", icon: "silo", showBeforeLogIn: false },
        {
          label: "dedicated nodes",
          path: "account-nodes",
          icon: "resistor-nodes",
          showBeforeLogIn: false,
        },
        { label: "dao", path: "account-dao", icon: "note-check-outline", showBeforeLogIn: false },
      ],
    },
    {
      label: "Explorer",
      icon: "database-search-outline",
      prefix: "/explorer/",
      active: this.mini ? false : true,
      children: [
        {
          label: "Statistics",
          path: "statistics",
          icon: "chart-scatter-plot",
          showBeforeLogIn: true,
        },
        {
          label: "Nodes",
          path: "nodes",
          icon: "access-point",
          showBeforeLogIn: true,
        },
        {
          label: "Farms",
          path: "farms",
          icon: "lan-connect",
          showBeforeLogIn: true,
        },
      ],
    },
    {
      label: "Calculators",
      icon: "calculator",
      prefix: "/calculator/",
      active: this.mini ? false : true,
      children: [
        {
          label: "Resource Pricing",
          path: "calculator",
          icon: "currency-usd",
          showBeforeLogIn: true,
        },
        {
          label: "Simulator",
          path: "simulator",
          icon: "chart-line",
          showBeforeLogIn: false,
          children: [
            {
              label: "Farming",
              path: "farm",
              icon: "lan-connect",
            },
          ],
        },
      ],
    },
    {
      label: "Zero-Os Bootstrap",
      icon: "earth",
      prefix: "/other/bootstrap",
      children: [],
    },
    {
      label: "Monitoring",
      icon: "equalizer",
      prefix: "https://metrics.grid.tf",
      hyperlink: true,
      children: [],
    },
    {
      label: "Zero-Os Hub",
      icon: "open-in-new",
      prefix: "https://hub.grid.tf/",
      hyperlink: true,
      children: [],
    },
    {
      label: "Playground",
      icon: "open-in-new",
      prefix: window.configs.PLAYGROUND_URL,
      hyperlink: true,
      children: [],
    },
  ];
  toggle() {
    this.$root.$emit("closeSidebar");
  }
}
</script>

<style>
@import "./assets/css/styles.css";

#app {
  background-color: var(--v-background-base);
}

.v-navigation-drawer {
  background-color: #333;
}

.loadingDialog {
  overflow: hidden;
}

.v-list-item__icon .theme--light.fa-chevron-down,
.v-list-item__icon .theme--light.fa-caret-down,
.v-list-item__icon .theme--light.fa-chevron-up,
.v-list-item__icon .theme--light.fa-caret-up {
  color: white !important;
}

.v-list .v-list-item--link:hover,
.v-list-item--link:before {
  background-color: #1982b1 !important;
  color: white !important;
  border-radius: 20px;
}

.v-list .v-list-item--active {
  border-radius: 20px;
}

.theme--dark.v-card > .v-card__text,
.theme--dark.v-card > .v-card__subtitle {
  color: rgb(255, 255, 255);
}

.theme--light.v-card > .v-card__text,
.theme--light.v-card > .v-card__subtitle {
  color: rgb(0, 0, 0);
}

.theme--light.v-btn.v-btn--icon {
  color: rgba(0, 0, 0);
}
</style>
