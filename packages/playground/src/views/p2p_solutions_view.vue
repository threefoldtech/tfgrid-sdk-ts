<template>
  <view-layout>
    <v-row>
      <v-col v-for="card in cards" :key="card.title">
        <router-link :to="'/deploy/p2p-applications' + card.route">
          <v-hover>
            <template v-slot:default="{ isHovering, props }">
              <v-card class="pa-3 pt-6" height="200" v-bind="props" :class="isHovering ? 'card-opacity' : undefined">
                <v-img
                  class="d-inline-block ml-3 mb-2"
                  width="35"
                  :src="baseURL + 'images/icons/' + card.icon"
                  :alt="card.title"
                  :style="{
                    filter: `brightness(${$vuetify.theme.global.name === 'light' ? 0.2 : 1})`,
                    lineHeight: 1,
                  }"
                />
                <v-card-title class="d-inline-block">
                  {{ card.title }}
                  <v-chip v-if="card.flare" class="ml-2 pulse-animation" color="#1AA18F" small text-color="white">
                    Community
                  </v-chip>
                </v-card-title>
                <v-card-text class="mt-2"> {{ card.excerpt }} </v-card-text>
              </v-card>
            </template></v-hover
          >
        </router-link>
      </v-col>
    </v-row>
  </view-layout>
</template>
<script lang="ts">
interface Card {
  title: string;
  excerpt: string;
  icon: string;
  route: string;
  flare?: string;
}

export default {
  name: "VmsView",
  setup() {
    const cards: Card[] = [
      {
        title: "Holochain",
        excerpt:
          "Holochain delivers beyond the promises of blockchain by providing a lightweight, secure and versatile framework for everyday distributed apps.",
        icon: "vm.png",
        route: "/holochain",
      },
      {
        title: "Holohost",
        excerpt:
          "Holo is to cloud hosting what Airbnb was to hotels—anyone can become a host by turning their computer into a source of revenue, getting paid in HoloFuel for hosting peer-to-peer applications.",
        icon: "vm.png",
        route: "/holohost",
      },
    ];
    const baseURL = import.meta.env.BASE_URL;

    return {
      cards,
      baseURL,
    };
  },
};
</script>

<style scoped>
a {
  text-decoration: none !important;
}

.card-opacity {
  background-color: rgba(125, 227, 200, 0.12);
}
</style>
