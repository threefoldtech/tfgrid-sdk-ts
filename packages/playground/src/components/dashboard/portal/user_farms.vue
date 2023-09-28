<template>
  <v-container> </v-container>
</template>

<script lang="ts">
import { useGrid, useProfileManager } from "../../../stores";

export default {
  name: "UserFarms",
  setup() {
    const gridStore = useGrid();
    const profileManager = useProfileManager();
    const twinId = profileManager.profile!.twinId;

    async function createFarm(name: string) {
      console.log("grid", gridStore.grid);
      try {
        return await gridStore.grid.farms.create({ name });
      } catch (error) {
        console.log(error);
      }
    }

    async function getUserFarms() {
      try {
        const userFarms = await gridStore.grid.capacity.getUserFarms({ twinId });
        return userFarms;
      } catch (error) {
        console.log(error);
      }
    }

    async function addFarmIp(farmId: number, ip: number, gw: number) {
      try {
        return await gridStore.grid.farms.addFarmIp({ farmId, ip, gw });
      } catch (error) {
        console.log(error);
      }
    }

    async function removeFarmIp(farmId: number, ip: number) {
      try {
        return await gridStore.grid.farms.removeFarmIp({ farmId, ip });
      } catch (error) {
        console.log(error);
      }
    }

    async function setStellarAddress(farmId: number, stellarAddress: string) {
      try {
        return await gridStore.grid.farms.addStellarAddress({ farmId, stellarAddress });
      } catch (error) {
        console.log(error);
      }
    }

    return {
      gridStore,
      createFarm,
      getUserFarms,
      addFarmIp,
      removeFarmIp,
      setStellarAddress,
    };
  },
};
</script>
