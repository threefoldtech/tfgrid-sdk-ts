<template>
  <v-container> this is farm nodes </v-container>
</template>

<script lang="ts">
import { useGrid, useProfileManager } from "../../../stores";

export default {
  name: "FarmNodes",
  setup() {
    const gridStore = useGrid();
    const profileManager = useProfileManager();

    async function getUserNodes() {
      try {
        const twinId = profileManager.profile!.twinId;
        return await gridStore.grid.capacity.getUserNodes({ twinId });
      } catch (error) {
        console.log(error);
      }
    }
    return {
      getUserNodes,
    };
  },
};
</script>
