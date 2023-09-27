<template>
  <v-container>
    <v-btn @click="createFarm">Click</v-btn>
  </v-container>
</template>

<script lang="ts">
import { ref } from "vue";

import { useGrid } from "../../../stores";

export default {
  name: "UserFarms",
  setup() {
    const gridStore = useGrid();
    const farmName = ref();

    function createFarm() {
      farmName.value = "new-farm";
      console.log("grid", gridStore.grid);
      gridStore.grid.farms.create(farmName.value);
    }
    return {
      gridStore,
      farmName,
      createFarm,
    };
  },
};
</script>
