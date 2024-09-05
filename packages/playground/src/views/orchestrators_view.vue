<template>
  <view-layout>
    <v-card color="primary" class="d-flex justify-center items-center mb-4 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-group</v-icon>
      <v-card-title class="pa-0">Orchestrators</v-card-title>
    </v-card>
    <ApplicationCards :cards="cards" />
  </view-layout>
</template>
<script lang="ts">
import ApplicationCards from "@/components/applications/ApplicationCards.vue";
import { DashboardRoutes } from "@/router/routes";
import type { ApplicationCard } from "@/utils/types";

export default {
  name: "Orchestrators View",
  components: {
    ApplicationCards,
  },
  setup() {
    const cards: ApplicationCard[] = [
      {
        title: "Kubernetes",
        excerpt:
          "Kubernetes is the standard container orchestration tool. On the TF grid, Kubernetes clusters can be deployed out of the box. We have implemented K3S, a full-blown Kubernetes offering that uses only half of the memory footprint.",
        icon: "kubernetes.png",
        route: DashboardRoutes.Orchestrators.Kubernetes,
        // releaseDate: { year: 2024, month: 9, day: 4 },
      },
      {
        title: "CapRover",
        excerpt:
          "CapRover is an extremely easy to use app/database deployment & web server manager for your NodeJS, Python, PHP, ASP.NET, Ruby, MySQL, MongoDB, Postgres, WordPress (and etc…) applications!",
        icon: "caprover.png",
        route: DashboardRoutes.Orchestrators.CapRover,
        // releaseDate: { year: 2024, month: 9, day: 4 },
      },
    ];

    return {
      cards,
    };
  },
};
</script>
