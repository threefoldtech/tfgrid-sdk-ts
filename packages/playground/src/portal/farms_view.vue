<template>
  <v-container>
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-silo</v-icon>
      <v-card-title class="pa-0 font-weight-bold">Farms</v-card-title>
    </v-card>

    <FarmNodes />
    <UserFarms />
  </v-container>
</template>

<script>
import FarmNodes from "../components/dashboard/portal/farm_nodes.vue";
import UserFarms from "../components/dashboard/portal/user_farms.vue";

export default {
  name: "PortalFarms",
  components: {
    FarmNodes,
    UserFarms,
  },
  setup() {
    return {};
  },
};
</script>
