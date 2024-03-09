<template>
  <v-footer class="py-5 mainfooter border">
    <v-container>
      <v-row justify="center" no-gutters>
        <v-col class="px-4 pr-10" cols="12" md="4" sm="12">
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
          <p class="mt-3 text-subtitle-2">
            A peer-to-peer open-source Internet platform that connects users directly with local Internet capacity.
          </p>
          <div>
            <a
              href="https://github.com/threefoldtech/tfgrid-sdk-ts"
              target="_blank"
              :style="{ color: 'rgb(var(--v-footer-color-link)) !important' }"
              ><v-btn class="" icon="mdi-github" variant="text"></v-btn
            ></a>
            <a
              href="mailto:info@threefold.io"
              target="_blank"
              :style="{ color: 'rgb(var(--v-footer-color)) !important' }"
              ><v-btn class="" icon="mdi-email-outline" variant="text"></v-btn
            ></a>
          </div>
        </v-col>
        <v-col class="" cols="4" md="2">
          <p class="text-subtitle-1 footer_header" color="secondary">Take Action</p>
          <div>
            <a
              color="error"
              href="https://www.manual.grid.tf/documentation/threefold_token/buy_sell_tft/buy_sell_tft.html"
              class="app-link text-subtitle-2"
              target="_blank"
              >Buy the Token</a
            >
          </div>
          <div>
            <a
              href="https://www.manual.grid.tf/documentation/farmers/farmers.html"
              class="app-link text-subtitle-2"
              target="_blank"
              >Start Farming</a
            >
          </div>
          <div>
            <a
              href="https://www.manual.grid.tf/knowledge_base/about/threefold_history.html"
              class="app-link text-subtitle-2"
              target="_blank"
              >Governance</a
            >
          </div>
        </v-col>
        <v-col class="mx-3" cols="4" md="2">
          <p color="primary" class="text-subtitle-1 footer_header">About Us</p>
          <div>
            <a
              href="https://threefold.io/"
              color="anchor"
              variant="text"
              class="app-link text-subtitle-2"
              target="_blank"
              >ThreeFold</a
            >
          </div>
          <div>
            <a href="https://www.threefold.io/blog/" class="app-link text-subtitle-2" target="_blank">Blog</a>
          </div>
          <div>
            <a href="https://www.threefold.io/newsroom/" class="app-link text-subtitle-2" target="_blank">News Room</a>
          </div>
          <div>
            <a href="https://www.threefold.io/community/" class="app-link text-subtitle-2" target="_blank">Community</a>
          </div>
        </v-col>

        <v-col class="mx-3" cols="2">
          <p class="text-subtitle-1 footer_header" color="secondary">Contact</p>
          <div>
            <a href="https://t.me/threefold" class="app-link text-subtitle-2" target="_blank">Main Chat</a>
          </div>
          <div>
            <a href="https://t.me/threefoldfarmers" class="app-link text-subtitle-2" target="_blank">Farming Chat</a>
          </div>
          <div>
            <a href="https://t.me/threefoldtesting" class="app-link text-subtitle-2" target="_blank">Grid User Chat</a>
          </div>
          <div>
            <a href="https://forum.threefold.io/" class="app-link text-subtitle-2" target="_blank">Forum</a>
          </div>
        </v-col>
      </v-row>
      <v-divider class="my-4" />
      <div class="text-center">{{ new Date().getFullYear() }} — ThreeFoldTech</div>
    </v-container>
  </v-footer>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";

import { DashboardRoutes } from "@/router/routes";
import { AppThemeSelection } from "@/utils/app_theme";

const theme = useTheme();

const baseUrl = import.meta.env.BASE_URL;
const $router = useRouter();

function navigateToHome() {
  return $router.push(DashboardRoutes.Other.HomePage);
}
</script>
<script lang="ts">
export default {
  name: "mainFooter",
  data: () => ({
    icons: ["mdi-github", "mdi-email-outline"],
  }),
};
</script>
<style>
.clickable-logo:hover {
  cursor: pointer;
}
.v-footer {
  position: relative;
}

.mainfooter a {
  color: rgb(var(--v-footer-color-link)) !important;
}
.mainfooter a:hover {
  color: rgb(153, 153, 153) !important;
}

.footer_header {
  color: rgb(var(--v-footer-color-header)) !important;
  font-weight: 500;
}
</style>
