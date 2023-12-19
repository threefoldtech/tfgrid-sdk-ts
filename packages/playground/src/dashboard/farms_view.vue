<template>
  <div class="border px-4 pb-4 rounded position-relative mt-2">
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-silo</v-icon>
      <v-card-title class="pa-0">Farms</v-card-title>
    </v-card>

    <CreateFarm v-model:name="name" class="mt-4" :userFarms="userFarms" />
    <UserFarms ref="userFarms" />
    <UserNodes />
  </div>
</template>

<script lang="ts">
import { ref } from "vue";

import CreateFarm from "./components/create_farm.vue";
import UserFarms from "./components/user_farms.vue";
import UserNodes from "./components/user_nodes.vue";

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
