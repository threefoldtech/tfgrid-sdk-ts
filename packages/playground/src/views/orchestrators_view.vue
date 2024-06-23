<template>
  <view-layout>
    <v-card color="primary" class="d-flex justify-center items-center mb-4 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-group</v-icon>
      <v-card-title class="pa-0">Orchestrators</v-card-title>
    </v-card>
    <v-row>
      <v-col v-for="card in cards" :key="card.title">
        <router-link :to="card.route">
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
                  <v-chip v-if="card.flare" class="ml-2 pulse-animation"> Community </v-chip>
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
import { DashboardRoutes } from "@/router/routes";

interface Card {
  title: string;
  excerpt: string;
  icon: string;
  route: string;
  flare?: string;
}

export default {
  name: "Orchestrators View",
  setup() {
    const cards: Card[] = [
      {
        title: "Kubernetes",
        excerpt:
          "Kubernetes is the standard container orchestration tool. On the TF grid, Kubernetes clusters can be deployed out of the box. We have implemented K3S, a full-blown Kubernetes offering that uses only half of the memory footprint.",
        icon: "kubernetes.png",
        route: DashboardRoutes.Orchestrators.Kubernetes,
      },
      {
        title: "CapRover",
        excerpt:
          "CapRover is an extremely easy to use app/database deployment & web server manager for your NodeJS, Python, PHP, ASP.NET, Ruby, MySQL, MongoDB, Postgres, WordPress (and etc…) applications!",
        icon: "caprover.png",
        route: DashboardRoutes.Orchestrators.CapRover,
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
