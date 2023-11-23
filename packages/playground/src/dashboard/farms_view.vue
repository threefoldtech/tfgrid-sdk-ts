<template>
  <v-container>
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-silo</v-icon>
      <v-card-title class="pa-0 font-weight-bold">Farms</v-card-title>
    </v-card>

    <CreateFarm v-model:name="name" class="mt-4" :userFarms="userFarms" />
    <UserFarms ref="userFarms" />
    <UserNodes />
  </v-container>
</template>

<script lang="ts">
import { ref } from "vue";

import CreateFarm from "../components/dashboard/create_farm.vue";
import UserFarms from "../components/dashboard/user_farms.vue";
import UserNodes from "../components/dashboard/user_nodes.vue";

export default {
  name: "DashboardFarms",
  components: {
    UserNodes,
    UserFarms,
    CreateFarm,
  },
  setup() {
    const name = ref<string>("");
    const userFarms = ref();
    return {
      name,
      userFarms,
    };
  },
};
</script>
