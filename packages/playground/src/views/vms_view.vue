<template>
  <view-layout>
    <v-card color="primary" class="d-flex justify-center items-center mb-4 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-television</v-icon>
      <v-card-title class="pa-0">Virtual Machines</v-card-title>
    </v-card>
    <ApplicationCards :cards="cards" />
  </view-layout>
</template>
<script lang="ts">
import ApplicationCards from "@/components/applications/ApplicationCards.vue";
import { DashboardRoutes } from "@/router/routes";
import type { ApplicationCard } from "@/utils/types";

export default {
  name: "VmsView",
  components: {
    ApplicationCards,
  },

  setup() {
    const cards: ApplicationCard[] = [
      {
        title: "Full Virtual Machine",
        excerpt:
          "Deploy a full virtual machine on Threefold Grid. Full VM allows you to have a complete image with a custom kernel optimized for your own usecase.",
        icon: "vm.png",
        route: DashboardRoutes.VirtualMachines.FullVirtualMachine,
      },
      {
        title: "Micro Virtual Machine",
        excerpt:
          "Deploy a micro virtual machine on Threefold Grid. We provide few images managed by Threefold like Ubuntu 22.04, and NixOS, but you can still use a custom one.",
        icon: "vm.png",
        route: DashboardRoutes.VirtualMachines.MicroVirtualMachine,
      },
    ];

    return {
      cards,
    };
  },
};
</script>
