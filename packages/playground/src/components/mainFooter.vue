<template>
  <v-footer class="py-5 border">
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
            <v-btn v-for="icon in icons" :key="icon" class="" :icon="icon" variant="text"></v-btn>
          </div>
        </v-col>
        <v-col class="mx-3" cols="4" md="2">
          <p color="primary" class="text-subtitle-1">About Us</p>
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
        <v-col class="" cols="4" md="2">
          <p class="text-subtitle-1" color="secondary">Take Action</p>
          <div>
            <a
              href="https://manual.grid.tf/threefold_token/buy_sell_tft/buy_sell_tft.html"
              class="app-link text-subtitle-2"
              target="_blank"
              >Buy the Token</a
            >
          </div>
          <div>
            <a href="https://manual.grid.tf/farmers/farmers.html" class="app-link text-subtitle-2" target="_blank"
              >Start Farming</a
            >
          </div>
          <div>
            <a
              href="https://library.threefold.me/info/threefold#/threefold__governance"
              class="app-link text-subtitle-2"
              target="_blank"
              >Governance</a
            >
          </div>
        </v-col>
        <v-col class="mx-3" cols="2">
          <p class="text-subtitle-1" color="secondary">Contact</p>
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

import { AppThemeSelection } from "@/utils/app_theme";

const theme = useTheme();

const baseUrl = import.meta.env.BASE_URL;
const $router = useRouter();

function navigateToHome() {
  return $router.push("/");
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
  bottom: 0;
  width: 100%;
}
</style>
