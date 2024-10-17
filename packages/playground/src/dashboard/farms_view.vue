<template>
  <div class="border px-4 pb-4 rounded position-relative mt-2">
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-silo</v-icon>
      <v-card-title class="pa-0">Farms</v-card-title>
    </v-card>

    <CreateFarm class="mt-4" @farm-created="farmsReload = true" />
    <UserFarms ref="userFarms" :reloadFarms="farmsReload" />
    <UserNodes />
  </div>
</template>

<script lang="ts">
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
    const farmsReload = ref<boolean>(false);

    return {
      farmsReload,
    };
  },
};
</script>
